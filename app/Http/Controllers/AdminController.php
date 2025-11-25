<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\User;
use App\Models\ValidateStudent;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use ZipArchive;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function win()
    // {
    //     $elections = Election::all();

    //     $winners = [];
    //     $positions = [
    //         'president' => 1,
    //         'external_vice_president' => 1,
    //         'internal_vice_president' => 1,
    //         'secretary' => 1,
    //         'treasurer' => 1,
    //         'auditor' => 1,
    //         'senator' => 8, // Allow up to 8 winners for senator
    //     ];

    //     foreach ($positions as $position => $limit) {
    //         // Find the candidates with the most votes for this position
    //         $topCandidates = Vote::select('candidate_id')
    //             ->where('position', $position)
    //             ->groupBy('candidate_id')
    //             ->orderByRaw('COUNT(*) DESC') // Order by vote count
    //             ->take($limit) // Limit to the specified number of winners
    //             ->get();

    //         if ($topCandidates->isNotEmpty()) {
    //             $winners[$position] = $topCandidates->map(function ($vote) {
    //                 return Candidate::find($vote->candidate_id);
    //             });
    //         } else {
    //             $winners[$position] = []; // No winners for this position
    //         }
    //     }

    //     return Inertia::render('admin/Winners', [
    //         'elections' => $elections,
    //         'winners' => $winners,
    //     ]);
    // }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $positions = [
            'president' => 1,
            'external_vice_president' => 1,
            'internal_vice_president' => 1,
            'secretary' => 1,
            'treasurer' => 1,
            'auditor' => 1,
            'senator' => 8, // Allow up to 8 winners for senator
        ];

        $voted_users_count = Vote::distinct('user_id')->count('user_id');
        $voted_users = User::whereHas('votes')->get();

        $candidates_count = Candidate::count();
        $election = Election::latest()->first();
        $candidates = Candidate::withCount('votes')
            ->orderBy('votes', 'desc')
            ->get();
        $winners = [];
        foreach ($positions as $position => $limit) {
            $topCandidates = Vote::select('candidate_id')
                ->where('position', $position)
                ->groupBy('candidate_id')
                ->orderByRaw('COUNT(*) DESC')
                ->take($limit)
                ->get();

            if ($topCandidates->isNotEmpty()) {
                $winners[$position] = $topCandidates->map(function ($vote) {
                    return Candidate::withCount('votes')->find($vote->candidate_id);
                });
            } else {
                $winners[$position] = [];
            }
        }
        $validated = User::withCount('votes')

            ->whereNotNull('student_id')
            ->where('student_id', '!=', '')
            ->when($search, function ($query, $search) {
                $search = Str::lower($search);

                if ($search === 'voted') {
                    $query->whereHas('votes');
                } elseif ($search === 'not voted') {
                    $query->whereDoesntHave('votes');
                } else {
                    $query->where(function ($q) use ($search) {
                        $q->where('student_id', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('lastname', 'like', "%{$search}%")
                            ->orWhere('course_program', 'like', "%{$search}%")
                            ->orWhere('year', 'like', "%{$search}%");
                    });
                }
            })
            ->get();

        return Inertia::render('AdminDashboard', [
            'election' => $election ?: null,
            'candidates_count' => $candidates_count,
            'voted_users' => $voted_users,
            'voted_users_count' => $voted_users_count,
            'candidates' => $candidates,
            'positions' => array_keys($positions), // only the names
            'winners' => $winners,
            'validated' => $validated,
        ]);
    }

    public function viewStudents(Request $request)
    {
        $search = $request->input('search');

        $validated = ValidateStudent::query()
            ->when($search, function ($query, $search) {
                $query->where('student_id', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->get();

        return Inertia::render('admin/Student', [
            'validated' => $validated,
            'search' => $search,
        ]);
    }

    public function viewVerifiedStudents(Request $request)
    {
        $search = $request->input('search');

        $validated = User::withCount('votes')
            ->whereNotNull('student_id')
            ->where('student_id', '!=', '')
            ->when($search, function ($query, $search) {
                $search = Str::lower($search);

                if ($search === 'voted') {
                    $query->whereHas('votes');
                } elseif ($search === 'not voted') {
                    $query->whereDoesntHave('votes');
                } else {
                    $query->where(function ($q) use ($search) {
                        $q->where('student_id', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('lastname', 'like', "%{$search}%")
                            ->orWhere('course_program', 'like', "%{$search}%")
                            ->orWhere('year', 'like', "%{$search}%");
                    });
                }
            })
            ->get();

        return Inertia::render('admin/VerifiedStudent', [
            'validated' => $validated,
            'search' => $search,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('admin/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Attempt to log in as an admin
        if (Auth::guard('admin')->attempt($credentials)) {
            // Regenerate the session to prevent session fixation attacks
            $request->session()->regenerate();

            // Redirect to the admin dashboard
            return redirect()->route('admin.dashboard');
        }

        // If the credentials do not match, return an error message
        return back()->withErrors([
            'email' => 'Credentials not found.', // Updated error message
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:validate_students,id',
        ]);

        ValidateStudent::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Selected students deleted successfully.');
    }

    public function bulkDeleteVerifiedStudents(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        User::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Selected students deleted successfully.');
    }

    public function destroy(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    // public function downloadResults()
    // {
    //     $candidates = Candidate::all();
    //     $zipFileName = 'election_results.zip';
    //     $zipPath = storage_path($zipFileName);

    //     // Create a new ZIP file
    //     $zip = new ZipArchive;
    //     if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {

    //         // Add CSV to ZIP
    //         $csvData = "Candidate Name,Course/program,Position,Votes,Image File\n"; // Header
    //         foreach ($candidates as $candidate) {
    //             $csvData .= "{$candidate->name},{$candidate->course_program},{$candidate->position},{$candidate->votes},{$candidate->image}\n";

    //             // Add each image to the ZIP
    //             $imagePath = storage_path("app/public/{$candidate->image}");
    //             if (file_exists($imagePath)) {
    //                 $zip->addFile($imagePath, "images/{$candidate->image}");
    //             }
    //         }

    //         $zip->addFromString('election_results.csv', $csvData); // Add CSV content to ZIP

    //         $zip->close();

    //         // Return ZIP file as a download
    //         return response()->download($zipPath)->deleteFileAfterSend(true);
    //     } else {
    //         return response()->json(['error' => 'Could not create ZIP file'], 500);
    //     }
    // }

    public function importStudents(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xls,xlsx,csv',
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheetData = $spreadsheet->getActiveSheet()->toArray();

        // Remove header row if exists
        array_shift($sheetData);

        $duplicates = [];
        $errors = [];
        $imported = 0;

        // Check for duplicate student IDs before inserting any records
        foreach ($sheetData as $index => $row) {
            // Skip empty rows
            if (empty($row[0])) {
                continue;
            }

            $studentId = trim($row[0]); // ID Number
            $lastName = trim($row[1]);  // Last name
            $firstName = trim($row[2]); // First name
            $middleName = trim($row[3] ?? ''); // Middle name
            $extName = trim($row[4] ?? '');    // Ext. name
            $sex = trim($row[5] ?? '');        // Sex
            $course = trim($row[6] ?? '');     // Course
            $major = trim($row[7] ?? '');      // Major
            $yearLevel = trim($row[8] ?? '');  // Year Level
            $birthDate = $row[9] ?? null;     // Birthdate

            // Validate required fields
            if (empty($studentId) || empty($lastName) || empty($firstName)) {
                $errors[] = [
                    'row' => $index + 2, // +2 because array index starts at 0 and we removed header
                    'student_id' => $studentId,
                    'error' => 'Missing required fields (ID Number, Last Name, or First Name)',
                ];

                continue;
            }

            // Check if student ID already exists in database
            $existingStudent = ValidateStudent::where('student_id', $studentId)->first();
            if ($existingStudent) {
                $duplicates[] = [
                    'row' => $index + 2,
                    'student_id' => $studentId,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ];
            }
        }

        // If duplicates found, stop the process and return the duplicates
        if (! empty($duplicates)) {
            return redirect()->back()->with([
                'error' => 'Duplicate student IDs found. Please review and try again.',
                'duplicates' => $duplicates,
            ]);
        }

        // If validation errors found, stop and return errors
        if (! empty($errors)) {
            return redirect()->back()->with([
                'error' => 'Validation errors found in the file.',
                'errors' => $errors,
            ]);
        }

        // No duplicates found, proceed with importing the students
        foreach ($sheetData as $index => $row) {
            // Skip empty rows
            if (empty($row[0])) {
                continue;
            }

            $studentId = trim($row[0]); // ID Number
            $lastName = trim($row[1]);  // Last name
            $firstName = trim($row[2]); // First name
            $middleName = trim($row[3] ?? ''); // Middle name
            $extName = trim($row[4] ?? '');    // Ext. name
            $sex = trim($row[5] ?? '');        // Sex
            $course = trim($row[6] ?? '');     // Course
            $major = trim($row[7] ?? '');      // Major
            $yearLevel = trim($row[8] ?? '');  // Year Level
            $birthDate = $row[9] ?? null;     // Birthdate

            try {
                // Parse birth date if it's an Excel date serial number
                if (is_numeric($birthDate) && $birthDate > 0) {
                    $birthDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($birthDate)->format('Y-m-d');
                } elseif (! empty($birthDate) && is_string($birthDate)) {
                    // Try to parse string dates
                    $birthDate = date('Y-m-d', strtotime($birthDate));
                } else {
                    $birthDate = null;
                }

                $student = new ValidateStudent;
                $student->student_id = $studentId;
                $student->last_name = $lastName;
                $student->first_name = $firstName;
                $student->middle_name = ! empty($middleName) ? $middleName : null;
                $student->ext_name = ! empty($extName) ? $extName : null;
                $student->sex = ! empty($sex) ? $sex : null;
                $student->course = ! empty($course) ? $course : null;
                $student->major = ! empty($major) ? $major : null;
                $student->year_level = ! empty($yearLevel) ? $yearLevel : null;
                $student->birth_date = $birthDate;
                $student->used = false; // Set default value
                $student->save();

                $imported++;
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $index + 2,
                    'student_id' => $studentId,
                    'error' => $e->getMessage(),
                ];
            }
        }

        // Handle errors if any occurred during import
        if (! empty($errors)) {
            return redirect()->back()->with([
                'warning' => "Imported {$imported} students, but ".count($errors).' failed.',
                'errors' => $errors,
            ]);
        }

        return redirect()->back()->with('success', "Successfully imported {$imported} students!");
    }

    public function advalidStudent(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|string|unique:validate_students,student_id',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'ext_name' => 'nullable|string|max:50',
            'sex' => 'nullable|in:Male,Female',
            'course' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
        ]);

        // Sanitize and prepare data
        $validated['student_id'] = trim($validated['student_id']);
        $validated['last_name'] = trim($validated['last_name']);
        $validated['first_name'] = trim($validated['first_name']);
        $validated['middle_name'] = isset($validated['middle_name']) ? trim($validated['middle_name']) : null;
        $validated['ext_name'] = isset($validated['ext_name']) ? trim($validated['ext_name']) : null;
        $validated['used'] = false; // Set default value

        // Create the student record
        $student = ValidateStudent::create($validated);

        return back()->with('success', 'Student added successfully: '.$student->first_name.' '.$student->last_name);
    }
}
