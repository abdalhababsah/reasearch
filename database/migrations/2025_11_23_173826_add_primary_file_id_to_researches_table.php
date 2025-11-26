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
        Schema::table('researches', function (Blueprint $table) {
            // Add the column after wallpaper_file_id
            $table->foreignId('primary_file_id')
                  ->nullable()
                  ->after('allow_dataset_browse') // Or after('wallpaper_file_id') if you prefer
                  ->constrained('files')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('researches', function (Blueprint $table) {
            $table->dropForeign(['primary_file_id']);
            $table->dropColumn('primary_file_id');
        });
    }
};