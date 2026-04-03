<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyVoice extends Model
{
    protected $fillable = ['project_id', 'week_number', 'week_label', 'start_date', 'end_date'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function voiceEntries()
    {
        return $this->hasMany(VoiceEntry::class);
    }
}
