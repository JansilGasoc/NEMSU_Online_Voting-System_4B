<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    //
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Try to find user by email
            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                // Save avatar locally (optional)
                $avatarPath = null;
                if ($googleUser->getAvatar()) {
                    $avatarContents = Http::get($googleUser->getAvatar())->body();
                    $filename = 'profile_pictures/'.uniqid('avatar_').'.jpg';
                    Storage::disk('public')->put($filename, $avatarContents);
                    $avatarPath = 'storage/'.$filename;
                }

                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'provider' => 'google',
                    'has_password' => false,
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(16)),
                    'profile_picture' => $avatarPath,
                ]);
            } else {
                // Update Google ID if missing
                if (! $user->google_id) {
                    $user->google_id = $googleUser->getId();
                    $user->provider = 'google';
                    $user->save();
                }
            }

            // Log in user
            Auth::login($user, true);
            $request->session()->regenerate();

            return redirect()->intended('/dashboard')->with('success', 'Welcome back!');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Authentication failed: '.$e->getMessage());
        }
    }

    protected function isProfileComplete(User $user): bool
    {
        return $user->student_id && $user->name && $user->profile && $user->lastname &&
            $user->course_program && $user->year;
    }
}
