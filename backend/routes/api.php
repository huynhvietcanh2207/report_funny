<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::apiResource('users', \App\Http\Controllers\UserController::class);
    Route::apiResource('projects', \App\Http\Controllers\ProjectController::class);
    Route::post('projects/{project}/members', [\App\Http\Controllers\ProjectController::class, 'addMembers']);
    Route::delete('projects/{project}/members/{userId}', [\App\Http\Controllers\ProjectController::class, 'removeMember']);
    Route::apiResource('voices', \App\Http\Controllers\VoiceEntryController::class);
    Route::apiResource('weekly-voices', \App\Http\Controllers\WeeklyVoiceController::class);
    Route::post('weekly-voices/{id}/generate-report', [\App\Http\Controllers\WeeklyReportController::class, 'generateReport']);

    // Config & Settings
    Route::get('/settings', [\App\Http\Controllers\ConfigController::class, 'index']);
    Route::post('/settings', [\App\Http\Controllers\ConfigController::class, 'update']);
    Route::get('/ai-config', [\App\Http\Controllers\ConfigController::class, 'getAIConfig']);
});
