<?php

namespace Database\Seeders;

use App\Models\ResearcherMajor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ResearcherMajorSeeder extends Seeder
{
    /**
     * Seed the researcher majors lookup table.
     */
    public function run(): void
    {
        $majors = [
            'Computer Science',
            'Artificial Intelligence',
            'Data Science',
            'Cybersecurity',
            'Biotechnology',
            'Biomedical Engineering',
            'Physics',
            'Chemistry',
            'Environmental Science',
            'Economics',
            'Psychology',
            'Sociology',
        ];

        foreach ($majors as $name) {
            ResearcherMajor::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
