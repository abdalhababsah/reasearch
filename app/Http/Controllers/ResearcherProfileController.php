<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResearcherEducationRequest;
use App\Http\Requests\ResearcherExperienceRequest;
use App\Http\Requests\ResearcherProfileRequest;
use App\Models\ResearcherEducation;
use App\Models\ResearcherExperience;
use App\Models\ResearcherMajor;
use App\Models\ResearcherProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResearcherProfileController extends Controller
{
    /**
     * Show the researcher profile edit page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('researcher/profile', $this->formProps($user));
    }

    /**
     * Prepare researcher profile props for Inertia responses.
     */
    public function formProps(User $user): array
    {
        $profile = $user->researcherProfile;
        $majors = ResearcherMajor::orderBy('name')->get();

        return [
            'profile' => $profile ? [
                'id' => $profile->id,
                'bio' => $profile->bio,
                'profile_image_url' => $profile->profile_image_url,
                'website' => $profile->website,
                'phone' => $profile->phone,
                'address' => $profile->address,
                'linkedin_url' => $profile->linkedin_url,
                'github_url' => $profile->github_url,
            ] : null,
            'experiences' => $profile ? $profile->experiences->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'title' => $exp->title,
                    'company' => $exp->company,
                    'start_date' => $exp->start_date?->format('Y-m-d'),
                    'end_date' => $exp->end_date?->format('Y-m-d'),
                    'description' => $exp->description,
                    'is_current' => $exp->is_current,
                ];
            }) : [],
            'educations' => $profile ? $profile->educations->map(function ($edu) {
                return [
                    'id' => $edu->id,
                    'institution' => $edu->institution,
                    'degree' => $edu->degree,
                    'field_of_study' => $edu->field_of_study,
                    'start_date' => $edu->start_date?->format('Y-m-d'),
                    'end_date' => $edu->end_date?->format('Y-m-d'),
                    'description' => $edu->description,
                ];
            }) : [],
            'majors' => $majors->map(function ($major) {
                return [
                    'id' => $major->id,
                    'name' => $major->name,
                    'slug' => $major->slug,
                ];
            }),
            'selected_majors' => $user->majors->pluck('id')->toArray(),
        ];
    }

    /**
     * Update or create the researcher profile.
     */
    public function update(ResearcherProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();
        
        // Handle major_ids 
        $majorIds = [];
        if (isset($data['major_ids'])) {
            if (is_string($data['major_ids'])) {
                $majorIds = json_decode($data['major_ids'], true) ?? [];
            } else {
                $majorIds = $data['major_ids'];
            }
        }
        unset($data['major_ids']);
    
        $profile = $user->researcherProfile;
    
        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($profile && $profile->profile_image) {
                Storage::disk('public')->delete($profile->profile_image);
            }
    
            $path = $request->file('profile_image')->store('profile-images', 'public');
            $data['profile_image'] = $path;
        }
    
        // Handle profile image removal
        if ($request->boolean('remove_profile_image')) {
            if ($profile && $profile->profile_image) {
                Storage::disk('public')->delete($profile->profile_image);
            }
            $data['profile_image'] = null;
        }
    
        // Remove these flags from data array as they're not database columns
        unset($data['remove_profile_image']);
    
        if ($profile) {
            $profile->update($data);
        } else {
            $profile = ResearcherProfile::create([
                'user_id' => $user->id,
                ...$data,
            ]);
        }
    
        // Sync majors
        $user->majors()->sync($majorIds);
    
        return redirect()->route('profile.edit')
            ->with('success', 'Profile updated successfully.');
    }

    /**
     * Store a new experience.
     */
    public function storeExperience(ResearcherExperienceRequest $request): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->researcherProfile;

        if (!$profile) {
            return redirect()->route('profile.edit')
                ->with('error', 'Please create your profile first.');
        }

        ResearcherExperience::create([
            'researcher_profile_id' => $profile->id,
            ...$request->validated(),
        ]);

        return redirect()->route('profile.edit')
            ->with('success', 'Experience added successfully.');
    }

    /**
     * Update an experience.
     */
    public function updateExperience(ResearcherExperienceRequest $request, ResearcherExperience $experience): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->researcherProfile;

        if (!$profile || $experience->researcher_profile_id !== $profile->id) {
            abort(403);
        }

        $experience->update($request->validated());

        return redirect()->route('profile.edit')
            ->with('success', 'Experience updated successfully.');
    }

    /**
     * Delete an experience.
     */
    public function destroyExperience(ResearcherExperience $experience): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->researcherProfile;

        if (!$profile || $experience->researcher_profile_id !== $profile->id) {
            abort(403);
        }

        $experience->delete();

        return redirect()->route('profile.edit')
            ->with('success', 'Experience deleted successfully.');
    }

    /**
     * Store a new education.
     */
    public function storeEducation(ResearcherEducationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->researcherProfile;

        if (!$profile) {
            return redirect()->route('profile.edit')
                ->with('error', 'Please create your profile first.');
        }

        ResearcherEducation::create([
            'researcher_profile_id' => $profile->id,
            ...$request->validated(),
        ]);

        return redirect()->route('profile.edit')
            ->with('success', 'Education added successfully.');
    }

    /**
     * Update an education.
     */
    public function updateEducation(ResearcherEducationRequest $request, ResearcherEducation $education): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->researcherProfile;

        if (!$profile || $education->researcher_profile_id !== $profile->id) {
            abort(403);
        }

        $education->update($request->validated());

        return redirect()->route('profile.edit')
            ->with('success', 'Education updated successfully.');
    }

    /**
     * Delete an education.
     */
    public function destroyEducation(ResearcherEducation $education): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->researcherProfile;

        if (!$profile || $education->researcher_profile_id !== $profile->id) {
            abort(403);
        }

        $education->delete();

        return redirect()->route('profile.edit')
            ->with('success', 'Education deleted successfully.');
    }
}
