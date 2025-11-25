<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'canRegister' => Route::has('register'),
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function updatePicture(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:8048',
        ]);

        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture
            if ($user->profile_picture) {
                // Extract just the path part if it's a full URL
                $oldPath = str_replace('/storage/', '', parse_url($user->profile_picture, PHP_URL_PATH));
                Storage::delete('public/'.$oldPath);
            }

            // Generate unique filename
            $file = $request->file('profile_picture');
            $extension = $file->getClientOriginalExtension();
            $filename = 'profile_'.$user->id.'_'.time().'.'.$extension;

            // Store the file
            $path = $file->storeAs('profile_pictures', $filename, 'public');

            // Store the full URL in database
            $user->profile_picture = '/storage/'.$path;
            $user->save();
        }

        return redirect()->back()->with('success', 'Profile picture updated successfully!');
    }

    public function updateBasic(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
        ]);

        $user->update([
            'name' => $request->name,
            'lastname' => $request->lastname,
            'email' => $request->email,
        ]);

        return back()->with('success', 'Profile information updated.');
    }

    public function updateSchool(Request $request)
    {
        $request->validate([
            'course_program' => ['required', 'string'],
            'year' => ['required', 'string'],
        ]);

        $user = Auth::user();

        // Check if there's an active election (Started status)
        $activeElection = Election::where('status', 'Started')->exists();

        // if ($activeElection) {
        //     return back()->with('error', 'You cannot update your information while an election is active.');
        // }

        // // Check if user has already voted in any election
        // $hasVoted = Vote::where('user_id', $user->id)->exists();

        // if ($hasVoted) {
        //     return back()->with('error', 'You cannot update your information after voting.');
        // }

        // Update user information
        $user->update([
            'course_program' => $request->course_program,
            'year' => $request->year,
        ]);

        return back()->with('success', 'Course and year updated successfully.');
    }
}
