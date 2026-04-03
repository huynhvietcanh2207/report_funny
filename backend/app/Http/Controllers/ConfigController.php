<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Config;
use Illuminate\Support\Facades\Gate;

class ConfigController extends Controller
{
    /**
     * Get all configurations (Admin only)
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Config::all()->pluck('value', 'key');
    }

    /**
     * Update or create configurations (Admin only)
     */
    public function update(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'gemini_api_keys' => 'nullable|array',
            'gemini_model' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Get AI configuration for analysis (All authenticated users)
     */
    public function getAIConfig()
    {
        $keys = Config::where('key', 'gemini_api_keys')->first()?->value ?? [];
        $model = Config::where('key', 'gemini_model')->first()?->value ?? 'gemini-2.0-flash-exp';

        return response()->json([
            'gemini_api_keys' => $keys,
            'gemini_model' => $model
        ]);
    }
}
