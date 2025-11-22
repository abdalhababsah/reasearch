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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_id')->constrained('researches')->onDelete('cascade');
            $table->foreignId('research_version_id')->nullable()->constrained('research_versions')->onDelete('cascade');
            $table->enum('type', ['document', 'dataset', 'wallpaper', 'image', 'supplementary']);
            $table->string('original_name');
            $table->string('storage_path');
            $table->string('mime_type');
            $table->bigInteger('size_bytes');
            $table->boolean('is_primary_doc')->default(false);
            $table->boolean('is_downloadable')->default(true);
            $table->string('checksum')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
