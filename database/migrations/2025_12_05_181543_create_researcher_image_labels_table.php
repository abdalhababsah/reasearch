<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('researcher_image_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('researcher_image_id')
                ->constrained('researcher_images')
                ->onDelete('cascade');
            $table->string('name', 100);
            $table->string('color', 7); // Hex color code
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Unique label names per image
            $table->unique(['researcher_image_id', 'name']);
            $table->index(['researcher_image_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('researcher_image_labels');
    }
};