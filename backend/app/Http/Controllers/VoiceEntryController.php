<?php

namespace App\Http\Controllers;

use App\Models\VoiceEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class VoiceEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        set_time_limit(120);

        // CHI TIẾT LOG ĐỂ DEBUG
        Log::info('Entry Request Data:', [
            'has_audio' => $request->hasFile('audio'),
            'audio_is_valid' => $request->file('audio') ? $request->file('audio')->isValid() : false,
            'audio_error' => $request->file('audio') ? $request->file('audio')->getError() : 'no_file',
            'project_id' => $request->input('project_id'),
            'source' => $request->input('source'),
            'content_type' => $request->header('Content-Type'),
        ]);

        $validator = Validator::make($request->all(), [
            'audio' => 'nullable', // Bỏ check 'file' để xem nó là cái gì
            'project_id' => 'required',
            'source' => 'nullable|string',
            'title' => 'nullable|string',
            'transcript' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        $path = null;
        if ($request->hasFile('audio')) {
            $path = $request->file('audio')->store('voices', 'public');
        }

        $weeklyVoice = \App\Models\WeeklyVoice::firstOrCreate([
            'project_id' => $request->project_id,
            'week_number' => now()->weekOfYear,
        ], [
            'start_date' => now()->startOfWeek(),
            'end_date' => now()->endOfWeek(),
            'week_label' => 'Tuần ' . now()->weekOfYear
        ]);

        try {
            $aiResult = $request->input('ai_result');

            if ($aiResult && is_string($aiResult)) {
                $aiResult = json_decode($aiResult, true);
            }

            if ($aiResult) {
                // Case 1: AI results already provided by frontend
                $entry = VoiceEntry::create([
                    'user_id' => $request->user()->id,
                    'weekly_voice_id' => $weeklyVoice->id,
                    'title' => $aiResult['title'] ?? ($request->input('title') ?: 'Báo cáo ngày ' . now()->format('d/m/Y')),
                    'audio_path' => $path,
                    'source' => $request->input('source', 'microphone'),
                    'transcript' => $aiResult['transcript'] ?? ($request->input('transcript') ?: ''),
                    'summary' => $aiResult['summary'] ?? '',
                    'key_points' => $aiResult['key_points'] ?? [],
                    'decisions' => $aiResult['decisions'] ?? [],
                    'action_items' => $aiResult['action_items'] ?? [],
                    'risks' => $aiResult['risks'] ?? [],
                    'progress' => $aiResult['progress'] ?? 0,
                    'tags' => $aiResult['tags'] ?? [],
                    'mindmap' => $aiResult['mindmap'] ?? null,
                ]);
            } elseif ($request->input('source') === 'manual') {
                // Case 2: Manual note without AI analysis
                $entry = VoiceEntry::create([
                    'user_id' => $request->user()->id,
                    'weekly_voice_id' => $weeklyVoice->id,
                    'title' => $request->input('title') ?? ('Ghi chú ngày ' . now()->format('d/m/Y')),
                    'audio_path' => null,
                    'source' => 'manual',
                    'transcript' => $request->input('transcript') ?? '',
                    'summary' => 'Ghi chú văn bản (Manual).',
                    'key_points' => [],
                    'decisions' => [],
                    'action_items' => [],
                    'risks' => [],
                    'progress' => 0,
                    'tags' => ['manual', 'note']
                ]);
            } else {
                // Case 3: Fallback (Server-side AI)
                if ($path) {
                    $dbKeys = \App\Models\Config::where('key', 'gemini_api_keys')->first()?->value ?? [];
                    $apiKey = !empty($dbKeys) ? $dbKeys[0] : $request->header('X-Gemini-Api-Key');
                    
                    $dbModel = \App\Models\Config::where('key', 'gemini_model')->first()?->value;
                    $model = $dbModel ?? $request->header('X-Gemini-Model') ?? 'gemini-1.5-flash';
                    
                    if (!$apiKey) {
                        Log::error('Voice Entry: API Key not found for server-side analysis');
                        throw new \Exception('Hệ thống chưa được cấu hình API Key. Vui lòng liên hệ Admin.');
                    }

                    $gemini = new \App\Services\GeminiService($apiKey, $model);
                    $analysis = $gemini->analyzeAudio($path);

                    $entry = VoiceEntry::create([
                        'user_id' => $request->user()->id,
                        'weekly_voice_id' => $weeklyVoice->id,
                        'title' => $analysis['title'] ?? ('Báo cáo ngày ' . now()->format('d/m/Y')),
                        'audio_path' => $path,
                        'source' => $request->input('source', 'upload'),
                        'transcript' => $analysis['transcript'] ?? '',
                        'summary' => $analysis['summary'] ?? '',
                        'key_points' => $analysis['key_points'] ?? [],
                        'decisions' => $analysis['decisions'] ?? [],
                        'action_items' => $analysis['action_items'] ?? [],
                        'risks' => $analysis['risks'] ?? [],
                        'progress' => $analysis['progress'] ?? 0,
                        'tags' => $analysis['tags'] ?? [],
                        'mindmap' => $analysis['mindmap'] ?? null,
                    ]);
                } else {
                    $entry = VoiceEntry::create([
                        'user_id' => $request->user()->id,
                        'weekly_voice_id' => $weeklyVoice->id,
                        'title' => $request->input('title') ?? ('Bản ghi ngày ' . now()->format('d/m/Y')),
                        'audio_path' => null,
                        'source' => $request->input('source', 'unknown'),
                        'transcript' => $request->input('transcript') ?? ''
                    ]);
                }
            }

            return response()->json($entry, 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Voice Entry Error: ' . $e->getMessage());
            $entry = VoiceEntry::create([
                'user_id' => $request->user()->id,
                'weekly_voice_id' => $weeklyVoice->id,
                'title' => 'Báo cáo ngày ' . now()->format('d/m/Y') . ' (Lỗi)',
                'audio_path' => $path,
                'transcript' => 'Lỗi phát sinh: ' . $e->getMessage(),
                'summary' => 'Lỗi server.',
                'tags' => ['error']
            ]);
            return response()->json($entry, 201);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(VoiceEntry $voice)
    {
        return response()->json($voice);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VoiceEntry $voice)
    {
        //
    }

    public function update(Request $request, VoiceEntry $voice)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $voice->update($validated);
        return response()->json($voice);
    }

    public function destroy(VoiceEntry $voice)
    {
        // Delete file from storage
        if ($voice->audio_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($voice->audio_path);
        }

        $voice->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
}
