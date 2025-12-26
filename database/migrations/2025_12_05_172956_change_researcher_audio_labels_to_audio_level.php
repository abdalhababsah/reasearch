<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('researcher_audio_labels', function (Blueprint $table) {
            // Step 1: Drop foreign key first (before index)
            $table->dropForeign(['user_id']);
            
            // Step 2: Drop unique constraint
            $table->dropUnique(['user_id', 'name']);
            
            // Step 3: Drop index
            $table->dropIndex(['user_id', 'is_active']);
            
            // Step 4: Remove user_id column
            $table->dropColumn('user_id');
        });

        // Separate schema call to add new column and constraints
        Schema::table('researcher_audio_labels', function (Blueprint $table) {
            // Step 5: Add researcher_audio_id with foreign key
            $table->foreignId('researcher_audio_id')
                ->after('id')
                ->constrained('researcher_audios')
                ->onDelete('cascade');
            
            // Step 6: Add new constraints
            $table->unique(['researcher_audio_id', 'name']);
            $table->index(['researcher_audio_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('researcher_audio_labels', function (Blueprint $table) {
            // Drop new constraints in reverse order
            $table->dropForeign(['researcher_audio_id']);
            $table->dropUnique(['researcher_audio_id', 'name']);
            $table->dropIndex(['researcher_audio_id', 'is_active']);
            $table->dropColumn('researcher_audio_id');
        });

        Schema::table('researcher_audio_labels', function (Blueprint $table) {
            // Restore user_id with constraints
            $table->foreignId('user_id')
                ->after('id')
                ->constrained('users')
                ->onDelete('cascade');
            
            $table->unique(['user_id', 'name']);
            $table->index(['user_id', 'is_active']);
        });
    }
};