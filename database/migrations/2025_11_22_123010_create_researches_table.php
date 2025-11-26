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
        Schema::create('researches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('researcher_id')->constrained('users')->onDelete('cascade');
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('abstract_en')->nullable();
            $table->text('abstract_ar')->nullable();
            $table->string('keywords_en')->nullable();
            $table->string('keywords_ar')->nullable();
            $table->enum('status', ['draft', 'under_review', 'published', 'archived'])->default('draft');
            $table->boolean('is_public')->default(true);
            $table->string('doi')->nullable();
            $table->string('journal_name')->nullable();
            $table->integer('year')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('researches');
    }
};
