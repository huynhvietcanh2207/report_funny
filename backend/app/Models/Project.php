<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['name', 'description', 'color', 'icon', 'status'];

    public function members()
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function weeklyVoices()
    {
        return $this->hasMany(WeeklyVoice::class);
    }
}
