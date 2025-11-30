<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Research;
use App\Models\ResearcherEducation;
use App\Models\ResearcherExperience;
use App\Models\ResearcherMajor;
use App\Models\ResearcherProfile;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SampleResearchDataSeeder extends Seeder
{
    /**
     * Seed sample researchers with full profiles, categories, tags, and researches.
     */
    public function run(): void
    {
        $this->seedCategories();
        $this->seedTags();

        $researcherUsers = $this->seedResearchers();

        $categories = Category::all();
        $tags = Tag::all();
        $majors = ResearcherMajor::all();

        // Create researches per researcher
        foreach ($researcherUsers as $index => $user) {
            $this->createProfileData($user, $majors);

            // Two researches each to showcase taxonomy usage
            $categorySet = $categories->random(2);
            $tagSet = $tags->random(3);

            $this->createResearch(
                $user,
                [
                    'title_en' => "Innovations in Renewable Energy {$index}",
                    'title_ar' => "ابتكارات في الطاقة المتجددة {$index}",
                    'abstract_en' => 'Exploring advancements in renewable energy integration and storage.',
                    'abstract_ar' => 'استكشاف التقدم في دمج الطاقة المتجددة وتخزينها.',
                    'keywords_en' => 'renewable,energy,storage,grid',
                    'keywords_ar' => 'طاقة,متجددة,تخزين,شبكة',
                ],
                $categorySet,
                $tagSet,
                2023
            );

            $this->createResearch(
                $user,
                [
                    'title_en' => "AI for Healthcare Outcomes {$index}",
                    'title_ar' => "الذكاء الاصطناعي لنتائج الرعاية الصحية {$index}",
                    'abstract_en' => 'Applying machine learning to predict and improve patient outcomes.',
                    'abstract_ar' => 'تطبيق التعلم الآلي للتنبؤ بنتائج المرضى وتحسينها.',
                    'keywords_en' => 'ai,healthcare,prediction,ml',
                    'keywords_ar' => 'ذكاء اصطناعي,رعاية صحية,تنبؤ,تعلم آلي',
                ],
                $categorySet->reverse(),
                $tags->random(3),
                2024
            );
        }
    }

    private function seedCategories(): void
    {
        $categories = [
            ['name_en' => 'Computer Science', 'name_ar' => 'علوم الحاسوب'],
            ['name_en' => 'Healthcare', 'name_ar' => 'الرعاية الصحية'],
            ['name_en' => 'Energy', 'name_ar' => 'الطاقة'],
            ['name_en' => 'Environment', 'name_ar' => 'البيئة'],
            ['name_en' => 'Economics', 'name_ar' => 'الاقتصاد'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => Str::slug($cat['name_en'])],
                [
                    'name_en' => $cat['name_en'],
                    'name_ar' => $cat['name_ar'],
                    'description' => $cat['name_en'] . ' category',
                ]
            );
        }
    }

    private function seedTags(): void
    {
        $tags = [
            ['name_en' => 'AI', 'name_ar' => 'ذكاء اصطناعي'],
            ['name_en' => 'Machine Learning', 'name_ar' => 'تعلم آلي'],
            ['name_en' => 'Climate', 'name_ar' => 'مناخ'],
            ['name_en' => 'Data Science', 'name_ar' => 'علوم البيانات'],
            ['name_en' => 'Security', 'name_ar' => 'أمن'],
            ['name_en' => 'Biotech', 'name_ar' => 'تقنية حيوية'],
            ['name_en' => 'Econometrics', 'name_ar' => 'اقتصاد قياسي'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(
                ['slug' => Str::slug($tag['name_en'])],
                ['name_en' => $tag['name_en'], 'name_ar' => $tag['name_ar']]
            );
        }
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function seedResearchers()
    {
        $roleId = \App\Models\Role::where('name', 'researcher')->value('id');

        $researchers = collect([
            ['first_name' => 'Lina', 'last_name' => 'Hassan', 'email' => 'lina@example.com'],
            ['first_name' => 'Omar', 'last_name' => 'Saleh', 'email' => 'omar@example.com'],
            ['first_name' => 'Sara', 'last_name' => 'Yousef', 'email' => 'sara@example.com'],
            ['first_name' => 'Karim', 'last_name' => 'Nassar', 'email' => 'karim@example.com'],
            ['first_name' => 'Maya', 'last_name' => 'Rahman', 'email' => 'maya@example.com'],
        ]);

        return $researchers->map(function ($data) use ($roleId) {
            return User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'role_id' => $roleId,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        });
    }

    private function createProfileData(User $user, $majors): void
    {
        $profile = ResearcherProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => 'Passionate researcher with a focus on interdisciplinary innovation.',
                'website' => 'https://example.com/' . Str::slug($user->first_name),
                'phone' => '123-456-7890',
                'address' => 'Innovation Hub, City',
                'linkedin_url' => 'https://linkedin.com/in/' . Str::slug($user->first_name . '-' . $user->last_name),
                'github_url' => 'https://github.com/' . Str::slug($user->first_name . $user->last_name),
            ]
        );

        // Majors (2 per researcher)
        $profile->majors()->syncWithoutDetaching(
            $majors->random(2)->pluck('id')->toArray()
        );

        // Education
        ResearcherEducation::firstOrCreate(
            [
                'researcher_profile_id' => $profile->id,
                'institution' => 'Global Tech University',
                'degree' => 'MSc',
            ],
            [
                'field_of_study' => 'Computer Science',
                'start_date' => Carbon::parse('2016-09-01'),
                'end_date' => Carbon::parse('2018-06-30'),
                'description' => 'Focused on applied machine learning and data-driven systems.',
            ]
        );

        // Experience
        ResearcherExperience::firstOrCreate(
            [
                'researcher_profile_id' => $profile->id,
                'title' => 'Senior Researcher',
                'company' => 'Future Labs',
            ],
            [
                'start_date' => Carbon::parse('2019-01-01'),
                'end_date' => null,
                'is_current' => true,
                'description' => 'Leading R&D projects and mentoring junior researchers.',
            ]
        );
    }

    private function createResearch(User $user, array $payload, $categories, $tags, int $year): Research
    {
        $research = Research::create([
            'researcher_id' => $user->id,
            'title_en' => $payload['title_en'],
            'title_ar' => $payload['title_ar'],
            'abstract_en' => $payload['abstract_en'],
            'abstract_ar' => $payload['abstract_ar'],
            'keywords_en' => $payload['keywords_en'],
            'keywords_ar' => $payload['keywords_ar'],
            'status' => 'published',
            'is_public' => true,
            'year' => $year,
            'published_at' => Carbon::create($year, 5, 1),
        ]);

        $research->categories()->sync($categories->pluck('id'));
        $research->tags()->sync($tags->pluck('id'));

        return $research;
    }
}
