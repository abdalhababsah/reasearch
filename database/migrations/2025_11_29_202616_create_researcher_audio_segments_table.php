<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('researcher_audio_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('researcher_audio_id')->constrained('researcher_audios')->onDelete('cascade');
            $table->foreignId('label_id')->constrained('researcher_audio_labels')->onDelete('cascade');

            // Time boundaries (in seconds with 3 decimal precision)
            $table->decimal('start_time', 10, 3);
            $table->decimal('end_time', 10, 3);

            // Optional notes/description for this segment
            $table->text('notes')->nullable();

            // Computed duration (can be virtual or stored)
            $table->decimal('duration', 10, 3)->storedAs('end_time - start_time');

            $table->timestamps();

            // Indexes for performance
            $table->index(['researcher_audio_id', 'start_time']);
            $table->index(['label_id']);
        });

        // Ensure segments don't have invalid time ranges
        // This will be enforced at application level + DB constraint
        DB::statement('ALTER TABLE researcher_audio_segments ADD CONSTRAINT check_valid_time_range CHECK (start_time < end_time)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('researcher_audio_segments');
    }
};