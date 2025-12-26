<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('researcher_image_annotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('researcher_image_id')
                ->constrained('researcher_images')
                ->onDelete('cascade');
            $table->foreignId('label_id')
                ->constrained('researcher_image_labels')
                ->onDelete('cascade');
            $table->decimal('x', 10, 2)->comment('Top-left X coordinate');
            $table->decimal('y', 10, 2)->comment('Top-left Y coordinate');
            $table->decimal('width', 10, 2)->comment('Bounding box width');
            $table->decimal('height', 10, 2)->comment('Bounding box height');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['researcher_image_id', 'label_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('researcher_image_annotations');
    }
};