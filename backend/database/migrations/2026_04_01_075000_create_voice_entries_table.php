<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('voice_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('weekly_voice_id')->constrained('weekly_voices')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('type')->default('daily');
            $table->string('source')->default('microphone');
            $table->string('audio_path')->nullable();
            $table->longText('transcript')->nullable();
            $table->text('summary')->nullable();
            $table->json('key_points')->nullable();
            $table->json('decisions')->nullable();
            $table->json('action_items')->nullable();
            $table->json('risks')->nullable();
            $table->integer('progress')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voice_entries');
    }
};
