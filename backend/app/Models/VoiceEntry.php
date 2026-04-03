<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoiceEntry extends Model
{
    protected $guarded = [];

    protected $casts = [
        'key_points' => 'array',
        'risks' => 'array',
        'tags' => 'array',
        'decisions' => 'array',
        'action_items' => 'array',
        'mindmap' => 'array',
    ];

    public function weeklyVoice()
    {
        return $this->belongsTo(WeeklyVoice::class);
    }
}
