<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyReport extends Model
{
    protected $guarded = [];

    protected $casts = [
        'member_summaries' => 'array',
        'next_week_suggestions' => 'array',
        'mindmap' => 'array',
    ];
}
