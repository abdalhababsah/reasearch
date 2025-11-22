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
        Schema::create('research_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_id')->constrained('researches')->onDelete('cascade');
            $table->integer('version_number');
            $table->string('label')->nullable();
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->string('keywords')->nullable();
            $table->string('doi')->nullable();
            $table->string('journal_name')->nullable();
            $table->integer('year')->nullable();
            $table->enum('status', ['draft', 'under_review', 'published', 'archived'])->default('draft');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_versions');
    }
};
