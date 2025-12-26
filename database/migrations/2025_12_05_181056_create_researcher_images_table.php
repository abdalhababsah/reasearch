<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('researcher_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('storage_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size_bytes');
            $table->unsignedInteger('width')->nullable(); // Image width in pixels
            $table->unsignedInteger('height')->nullable(); // Image height in pixels
            $table->enum('status', ['draft', 'labeled', 'exported'])->default('draft');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamp('labeled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('uploaded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('researcher_images');
    }
};