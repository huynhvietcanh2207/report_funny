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

    public function __construct($apiKey = null, $model = 'gemini-2.5-flash')
    {
        $this->apiKey = $apiKey ?: env('GEMINI_API_KEY');
        $this->model = $model ?: 'gemini-2.5-flash';
    }

    public function analyzeAudio($audioFilePath)
    {
        $fullPath = storage_path('app/public/' . $audioFilePath);
        if (!file_exists($fullPath)) {
            throw new \Exception("Audio file not found.");
        }

        // Upload to Gemini File API first because audio files usually need separate upload
        $mimeType = mime_content_type($fullPath);
        $fileSize = filesize($fullPath);

        $uploadUrl = "https://generativelanguage.googleapis.com/upload/v1beta/files?key={$this->apiKey}";

        $uploadResponse = Http::withHeaders([
            'X-Goog-Upload-Protocol' => 'raw',
            'X-Goog-Upload-Command' => 'upload, finalize',
            'X-Goog-Upload-Header-Content-Length' => $fileSize,
            'X-Goog-Upload-Header-Content-Type' => $mimeType,
            'Content-Type' => $mimeType,
        ])->send('POST', $uploadUrl, [
                    'body' => file_get_contents($fullPath)
                ]);

        if (!$uploadResponse->successful()) {
            throw new \Exception("Gemini Upload Failed: " . $uploadResponse->body());
        }

        $fileUri = $uploadResponse->json('file.uri');
        $fileName = $uploadResponse->json('file.name');

        // Wait for file to be processed (ACTIVE state)
        // Especially needed for audio files which take a few seconds
        $fileStatusUrl = "https://generativelanguage.googleapis.com/v1beta/{$fileName}?key={$this->apiKey}";
        $attempts = 0;
        $state = 'PROCESSING';
        while ($attempts < 60) {
            $statusResponse = Http::get($fileStatusUrl);
            $state = $statusResponse->json('state');
            if ($statusResponse->successful() && $state === 'ACTIVE') {
                break;
            }
            if ($state === 'FAILED') {
                throw new \Exception("Gemini File Processing Failed.");
            }
            sleep(1);
            $attempts++;
        }

        if ($state !== 'ACTIVE') {
            throw new \Exception("Gemini File Processing Timeout (Still $state after 60s).");
        }

        $generateUrl = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $systemInstruction = "Bạn là AI chuyên phân tích báo cáo công việc thời gian thực trong môi trường doanh nghiệp. Phân tích file ghi âm/báo cáo dưới đây và trả về định dạng JSON thuần túy (KHÔNG có markdown block như ```json). Định dạng YẾU CẦU: { \"title\": \"Tiêu đề tự đặt < 60 ký tự\", \"summary\": \"Tóm tắt 3-5 câu\", \"transcript\": \"Chép lại chi tiết nội dung (dịch sang tiếng Việt nếu cần)\", \"key_points\": [\"point 1\"], \"decisions\": [{\"content\":\"...\",\"owner\":\"...\"}], \"action_items\": [{\"task\":\"...\",\"priority\":\"high|medium|low\",\"owner\":\"...\",\"deadline\":\"...\",\"status\":\"pending\"}], \"risks\": [\"...\"], \"progress\": 65, \"tags\": [\"tag1\"] }";

        $promptResponse = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($generateUrl, [
                    'system_instruction' => [
                        'parts' => [
                            ['text' => $systemInstruction]
                        ]
                    ],
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                [
                                    'file_data' => [
                                        'mime_type' => $mimeType,
                                        'file_uri' => $fileUri
                                    ]
                                ],
                                [
                                    'text' => 'Báo cáo này chứa những nội dung công việc gì? Hãy làm theo instructions.'
                                ]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'response_mime_type' => 'application/json'
                    ]
                ]);

        if (!$promptResponse->successful()) {
            throw new \Exception("Gemini Generate Failed: " . $promptResponse->body());
        }

        $jsonText = $promptResponse->json('candidates.0.content.parts.0.text');

        // Sometimes the AI still includes markdown block, clean it up
        $jsonText = preg_replace('/```json\s*/', '', $jsonText);
        $jsonText = preg_replace('/```\s*/', '', $jsonText);

        return json_decode(trim($jsonText), true);
    }

    public function generateWeeklyReport($compiledTranscripts)
    {
        $generateUrl = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $systemInstruction = "Bạn là AI quản lý dự án. Hãy tổng hợp các báo cáo hàng ngày của team trong tuần qua và sinh ra một JSON báo cáo tổng kết. YÊU CẦU định dạng JSON thuần: { \"overall_summary\": \"Tóm tắt chung tình hình team\", \"team_progress\": 75, \"member_summaries\": [ { \"user_id\": 1, \"accomplishments\": [\"Làm xong A\"], \"completed_items\": [\"B\"], \"pending_items\": [\"C\"], \"risks\": [\"D\"] } ], \"next_week_suggestions\": [\"Gợi ý 1\"] }";

        $promptResponse = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($generateUrl, [
                    'system_instruction' => [
                        'parts' => [['text' => $systemInstruction]]
                    ],
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => "Dưới đây là các bản ghi chép giọng nói trong tuần:\n\n" . $compiledTranscripts]]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'response_mime_type' => 'application/json'
                    ]
                ]);

        if (!$promptResponse->successful()) {
            throw new \Exception("Gemini Generate Failed: " . $promptResponse->body());
        }

        $jsonText = $promptResponse->json('candidates.0.content.parts.0.text');
        $jsonText = preg_replace('/```json\s*/', '', $jsonText);
        $jsonText = preg_replace('/```\s*/', '', $jsonText);

        return json_decode(trim($jsonText), true);
    }
}
