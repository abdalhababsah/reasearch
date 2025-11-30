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
            $table->foreignId('wallpaper_file_id')->nullable()->constrained('files')->onDelete('set null');
            $table->foreignId('current_version_id')->nullable()->after('wallpaper_file_id')->constrained('research_versions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('researches', function (Blueprint $table) {
            $table->dropForeign(['wallpaper_file_id']);
            $table->dropForeign(['current_version_id']);
            $table->dropColumn(['wallpaper_file_id', 'current_version_id']);
        });
    }
};
