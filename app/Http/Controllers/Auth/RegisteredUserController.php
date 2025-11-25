<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ValidateStudent;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function completeProfile(Request $request)
    {
        $user = Auth::user();

        // Define validation rules
        $rules = [
            'student_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'lastname' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'name' => 'required|string|max:255',
            'middle_name' => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'course_program' => 'required|string|max:255',
            'year' => 'required|string|max:255',
        ];

        // Custom validation messages
        $messages = [
            'name.regex' => 'Last name can only contain letters, spaces and hyphens.',
            'lastname.regex' => 'Last name can only contain letters, spaces and hyphens.',
            'middle_name.regex' => 'Last name can only contain letters, spaces and hyphens.',
        ];

        $validatedData = $request->validate($rules, $messages);

        try {
            // Validate student credentials against pre-registered records
            $student = $this->validateUserConfirm($request);

            // Update user details
            $user->fill([
                'student_id' => $validatedData['student_id'],
                'name' => $validatedData['name'],
                'lastname' => $validatedData['lastname'],
                'middle_name' => $validatedData['middle_name'],
                'course_program' => $validatedData['course_program'],
                'year' => $validatedData['year'],
            ]);

            // Use database transaction for atomic operations
            DB::transaction(function () use ($user, $student) {
                $user->save();

                // Mark student record as used
                $student->used = true;
                $student->save();
            });

            return redirect()
                ->back()
                ->with('success', 'Profile completed successfully! You can now vote.');
        } catch (ValidationException $e) {
            return redirect()
                ->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Profile completion error: '.$e->getMessage());

            return back()
                ->with('error', 'An unexpected error occurred. Please try again later.');
        }
    }

    protected function validateUserConfirm(Request $request)
    {
        // Sanitize inputs
        $studentId = trim($request->student_id);
        $lastname = trim($request->lastname);
        $name = trim($request->name);
        $middleName = trim($request->middle_name);

        // Attempt to find the student record with case-insensitive comparison
        $student = ValidateStudent::where('student_id', 'like', $studentId)
            ->whereRaw('LOWER(last_name) = ?', [strtolower($lastname)])
            ->whereRaw('LOWER(first_name) = ?', [strtolower($name)])
            ->when(! empty($middleName), function ($query) use ($middleName) {
                return $query->whereRaw('LOWER(middle_name) = ?', [strtolower($middleName)]);
            })
            ->first();

        if (! $student) {
            throw ValidationException::withMessages([
                'student_id' => 'The provided student credentials do not match our records ir doesn`t exist if you have questions please contact the administrator.',
            ]);
        }

        if ($student->used) {
            throw ValidationException::withMessages([
                'student_id' => 'This student ID has already been registered.',
            ]);
        }

        return $student;
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     * */

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore(Auth::id()), // ✅ ignores current user
            ],
            'lastname' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'middle_name' => 'required|string|max:255',
            'course_program' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'profile_picture' => 'nullable|url|max:2048', // Add this line
        ]);
        if ($request->hasFile('profile_picture')) {
            $profilePicPath = $request->file('profile_picture')->store('profile_pictures', 'public');
        } else {
            $profilePicPath = null;
        }
        try {
            $student = $this->validateUserConfirm($request);
        } catch (ValidationException $e) {
            // If validation fails, return back with the validation errors
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
        $user = User::create([
            'student_id' => $request->student_id,
            'lastname' => $request->lastname,
            'name' => $request->name,
            'middle_name' => $request->middle_name,
            'course_program' => $request->course_program,
            'year' => $request->year,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_picture' => $request->profile_picture,
        ]);
        $student->used = true;
        $student->save();
        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    protected function validateUserDetails(Request $request)
    {
        $studentId = trim($request->student_id);
        $lastname = trim($request->lastname);
        $name = trim($request->name);
        $middleName = trim($request->middle_name);

        // Attempt to find the student record with case-insensitive comparison
        $student = ValidateStudent::where('student_id', 'like', $studentId)
            ->whereRaw('LOWER(last_name) = ?', [strtolower($lastname)])
            ->whereRaw('LOWER(first_name) = ?', [strtolower($name)])
            ->when(! empty($middleName), function ($query) use ($middleName) {
                return $query->whereRaw('LOWER(middle_name) = ?', [strtolower($middleName)]);
            })
            ->first();

        if (! $student) {
            throw ValidationException::withMessages([
                'student_id' => 'The provided student credentials do not match our records ir doesn`t exist if you have questions please contact the administrator.',
            ]);
        }

        if ($student->used) {
            throw ValidationException::withMessages([
                'student_id' => 'This student ID has already been registered.',
            ]);
        }

        return $student;
    }
}
