<?php

namespace App\Http\Controllers;

use App\Models\WeeklyReport;
use Illuminate\Http\Request;

class WeeklyReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reports = \App\Models\WeeklyReport::all();
        return response()->json($reports);
    }

    public function show(\App\Models\WeeklyReport $weeklyReport)
    {
        return response()->json($weeklyReport);
    }

    public function generateReport(Request $request, $weeklyVoiceId)
    {
        $weeklyVoice = \App\Models\WeeklyVoice::with('voiceEntries.user')->findOrFail($weeklyVoiceId);

        if ($weeklyVoice->voiceEntries->isEmpty()) {
            return response()->json(['message' => 'No voice entries found for this week'], 400);
        }

        $compiledTranscripts = $weeklyVoice->voiceEntries->map(function ($entry) {
            $userName = $entry->user ? $entry->user->name : 'Unknown';
            return "User: {$userName} (ID: {$entry->user_id}), Role: Báo cáo ({$entry->title}): " . $entry->transcript;
        })->implode("\n\n---\n\n");

        try {
            $dbKeys = \App\Models\Config::where('key', 'gemini_api_keys')->first()?->value ?? [];
            $apiKeys = !empty($dbKeys) ? $dbKeys : [$request->header('X-Gemini-Api-Key')];
            // Remove empty keys
            $apiKeys = array_filter($apiKeys);

            $dbModel = \App\Models\Config::where('key', 'gemini_model')->first()?->value;
            $model = $dbModel ?? $request->header('X-Gemini-Model') ?? 'gemini-3.5-flash';

            if (empty($apiKeys)) {
                return response()->json(['message' => 'Hệ thống chưa được cấu hình API Key. Vui lòng liên hệ Admin.'], 400);
            }

            $reportData = null;
            $lastError = '';

            foreach ($apiKeys as $apiKey) {
                try {
                    $gemini = new \App\Services\GeminiService($apiKey, $model);
                    $reportData = $gemini->generateWeeklyReport($compiledTranscripts);
                    if ($reportData) {
                        break; // Success
                    }
                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    \Illuminate\Support\Facades\Log::warning('Weekly Report: Key failed, trying next. Error: ' . $lastError);
                    continue; // Try next key
                }
            }

            if (!$reportData) {
                throw new \Exception("Tất cả API Keys đều thất bại hoặc hết hạn mức. Lỗi cuối cùng: " . $lastError);
            }

            $report = \App\Models\WeeklyReport::updateOrCreate(
                ['weekly_voice_id' => $weeklyVoice->id, 'project_id' => $weeklyVoice->project_id],
                [
                    'overall_summary' => $reportData['overall_summary'] ?? 'Không có tóm tắt',
                    'team_progress' => $reportData['team_progress'] ?? 0,
                    'member_summaries' => $reportData['member_summaries'] ?? [],
                    'next_week_suggestions' => $reportData['next_week_suggestions'] ?? [],
                    'mindmap' => $reportData['mindmap'] ?? null,
                ]
            );

            return response()->json($report, 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Report Generation Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
