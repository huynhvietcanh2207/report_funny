<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GeminiService
{
    protected $apiKey;
    protected $model;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct($apiKey = null, $model = 'gemini-3.5-flash')
    {
        $this->apiKey = $apiKey ?: env('GEMINI_API_KEY');
        $this->model = $model ?: 'gemini-3.5-flash';
    }

    public function analyzeAudio($audioFilePath)
    {
        $fullPath = storage_path('app/public/' . $audioFilePath);
        if (!file_exists($fullPath)) {
            throw new \Exception("Audio file not found.");
        }

        $mimeType = mime_content_type($fullPath);
        $fileSize = filesize($fullPath);

        // ── Upload to Gemini File API ─────────────────────────────────────────
        $uploadUrl = "https://generativelanguage.googleapis.com/upload/v1beta/files?key={$this->apiKey}";

        $uploadResponse = Http::withHeaders([
            'X-Goog-Upload-Protocol'              => 'raw',
            'X-Goog-Upload-Command'               => 'upload, finalize',
            'X-Goog-Upload-Header-Content-Length' => $fileSize,
            'X-Goog-Upload-Header-Content-Type'   => $mimeType,
            'Content-Type'                        => $mimeType,
        ])->timeout(300)->send('POST', $uploadUrl, [
            'body' => file_get_contents($fullPath)
        ]);

        if (!$uploadResponse->successful()) {
            throw new \Exception("Gemini Upload Failed: " . $uploadResponse->body());
        }

        $fileUri  = $uploadResponse->json('file.uri');
        $fileName = $uploadResponse->json('file.name');

        // ── Poll until ACTIVE (max 3 minutes for long recordings) ─────────────
        $fileStatusUrl = "https://generativelanguage.googleapis.com/v1beta/{$fileName}?key={$this->apiKey}";
        $attempts = 0;
        $maxAttempts = 180; // 3 minutes at ~1s intervals
        $state = 'PROCESSING';

        while ($attempts < $maxAttempts) {
            $statusResponse = Http::get($fileStatusUrl);
            $state = $statusResponse->json('state');
            if ($statusResponse->successful() && $state === 'ACTIVE') break;
            if ($state === 'FAILED') throw new \Exception("Gemini File Processing Failed.");
            sleep(1);
            $attempts++;
        }

        if ($state !== 'ACTIVE') {
            throw new \Exception("Gemini File Processing Timeout (Still {$state} after {$maxAttempts}s).");
        }

        // ── Generate analysis ─────────────────────────────────────────────────
        $generateUrl = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $systemInstruction = <<<'PROMPT'
Bạn là AI phân tích báo cáo công việc chuyên nghiệp trong doanh nghiệp Việt Nam.
NHIỆM VỤ: Nghe nội dung file ghi âm và trích xuất thông tin theo cấu trúc.
QUY TẮC BẮT BUỘC:
- Trả lời hoàn toàn bằng tiếng Việt.
- Chỉ trả về JSON thuần túy. Không có markdown, không có giải thích.
- Điền đầy đủ tất cả các trường. Dùng mảng rỗng [] nếu không có dữ liệu.
- progress là số nguyên 0-100 ước tính % hoàn thành công việc được đề cập.

SCHEMA JSON BẮT BUỘC:
{
  "title": "string (tối đa 60 ký tự)",
  "summary": "string (3-5 câu tóm tắt)",
  "transcript": "string (chép lại toàn bộ lời thoại, dịch sang tiếng Việt nếu cần)",
  "key_points": ["string"],
  "decisions": [{"content": "string", "owner": "string"}],
  "action_items": [{"task": "string", "priority": "high|medium|low", "owner": "string", "deadline": "string", "status": "pending"}],
  "risks": ["string"],
  "progress": 0,
  "tags": ["string"],
  "mindmap": {
    "center": "string",
    "branches": [{"label": "string", "children": ["string"]}]
  }
}
Mindmap phải có 3-5 nhánh chính, mỗi nhánh 2-4 ý con.
PROMPT;

        $promptResponse = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->timeout(120)->post($generateUrl, [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [[
                'role'  => 'user',
                'parts' => [
                    ['file_data' => ['mime_type' => $mimeType, 'file_uri' => $fileUri]],
                    ['text'      => 'Phân tích file ghi âm này và trả về JSON theo đúng schema. Chỉ trả về JSON.']
                ]
            ]],
            'generationConfig' => [
                'temperature'        => 0.15,
                'response_mime_type' => 'application/json'
            ]
        ]);

        if (!$promptResponse->successful()) {
            throw new \Exception("Gemini Generate Failed: " . $promptResponse->body());
        }

        $jsonText = $promptResponse->json('candidates.0.content.parts.0.text');
        $jsonText = preg_replace('/^```json\s*/i', '', trim($jsonText));
        $jsonText = preg_replace('/```\s*$/i', '', $jsonText);

        return json_decode(trim($jsonText), true);
    }

    public function generateWeeklyReport($compiledTranscripts)
    {
        $generateUrl = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $systemInstruction = <<<'PROMPT'
Bạn là AI quản lý dự án chuyên nghiệp trong doanh nghiệp Việt Nam.
NHIỆM VỤ: Tổng hợp các báo cáo hàng ngày của team trong tuần và sinh báo cáo tổng kết.
QUY TẮC BẮT BUỘC:
- Trả lời hoàn toàn bằng tiếng Việt.
- Chỉ trả về JSON thuần túy. Không có markdown, không có giải thích.
- Điền đầy đủ tất cả các trường. Dùng mảng rỗng [] nếu không có dữ liệu.
- team_progress là số nguyên 0-100 đánh giá tổng thể tiến độ team.
- member_summaries phải liệt kê đầy đủ tất cả thành viên có báo cáo.

SCHEMA JSON BẮT BUỘC:
{
  "overall_summary": "string (tóm tắt 3-5 câu về tình hình chung của team trong tuần)",
  "team_progress": 0,
  "member_summaries": [
    {
      "user_id": 0,
      "user_name": "string",
      "accomplishments": ["string"],
      "completed_items": ["string"],
      "pending_items": ["string"],
      "risks": ["string"]
    }
  ],
  "next_week_suggestions": ["string"],
  "mindmap": {
    "center": "string (chủ đề tổng tuần)",
    "branches": [{"label": "string", "children": ["string"]}]
  }
}
Mindmap phải có 3-5 nhánh chính, mỗi nhánh 2-4 ý con.
PROMPT;

        $promptResponse = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->timeout(120)->post($generateUrl, [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [[
                'role'  => 'user',
                'parts' => [['text' => "Dưới đây là toàn bộ báo cáo giọng nói của team trong tuần này. Hãy tổng hợp và trả về JSON theo đúng schema:\n\n" . $compiledTranscripts]]
            ]],
            'generationConfig' => [
                'temperature'        => 0.15,
                'response_mime_type' => 'application/json'
            ]
        ]);

        if (!$promptResponse->successful()) {
            throw new \Exception("Gemini Generate Failed: " . $promptResponse->body());
        }

        $jsonText = $promptResponse->json('candidates.0.content.parts.0.text');
        $jsonText = preg_replace('/^```json\s*/i', '', trim($jsonText));
        $jsonText = preg_replace('/```\s*$/i', '', $jsonText);

        return json_decode(trim($jsonText), true);
    }
}
