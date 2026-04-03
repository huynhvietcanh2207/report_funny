<?php

namespace App\Http\Controllers;

use App\Models\WeeklyVoice;
use Illuminate\Http\Request;

class WeeklyVoiceController extends Controller
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    public function show(WeeklyVoice $weeklyVoice)
    {
        return response()->json($weeklyVoice->load(['voiceEntries']));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WeeklyVoice $weeklyVoice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WeeklyVoice $weeklyVoice)
    {
        $request->validate([
            'week_label' => 'sometimes|required|string|max:255',
        ]);

        $weeklyVoice->update($request->only('week_label'));

        return response()->json($weeklyVoice);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WeeklyVoice $weeklyVoice)
    {
        // Many-to-many relationship cleanup (if any) or cascade delete should happen here
        // Assuming VoiceEntry cascade deletes via DB migration or Model events
        $weeklyVoice->delete();

        return response()->json(['message' => 'Xóa tuần thành công!']);
    }
}
