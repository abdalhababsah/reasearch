<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('researcher_audios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // File information
            $table->string('original_filename');
            $table->string('stored_filename')->unique();
            $table->string('storage_path');
            $table->string('mime_type', 100);
            $table->bigInteger('file_size_bytes');
            $table->decimal('duration_seconds', 10, 2)->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Can store sample rate, bit rate, channels, etc.
            
            // Status and visibility
            $table->enum('status', ['draft', 'labeled', 'exported'])->default('draft');
            
            // Title and description (optional)
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            
            // Timestamps
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamp('labeled_at')->nullable(); // When all segments were completed
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('researcher_audios');
    }
};