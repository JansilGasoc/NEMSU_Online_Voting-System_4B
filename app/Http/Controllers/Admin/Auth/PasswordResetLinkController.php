<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PasswordResetLinkController extends Controller
{
    //
    public function create()
    {
        return Inertia::render('admin/Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::broker('admins')->sendResetLink(
            $request->only('email')
        );

        // Check if the status is either sent or throttled
        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        // If throttled, show success message anyway (optional)
        if ($status == Password::RESET_THROTTLED) {
            return back()->with('status', 'We have emailed your password reset link!');
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
