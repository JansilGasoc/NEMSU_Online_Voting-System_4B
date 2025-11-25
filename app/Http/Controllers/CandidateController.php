<?php

namespace App\Http\Controllers;

use App\Jobs\BulkDeleteCandidates;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CandidateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Load candidates with their vote counts
        $candidates = Candidate::withCount('votes')->get();
        $users = User::all();
        $elections = Election::all();

        return Inertia::render('admin/Candidate', [
            'candidates' => $candidates,
            'users' => $users,
            'elections' => $elections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */

    //

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'course_program' => 'required|string|max:255',
            'party_list' => 'required|string|max:255',
            'date_of_filling' => 'required|date',
            'year_level' => 'string|max:255',
            'age' => 'integer|min:16|max:60',
            'image' => 'required|image|max:10240', // allow image
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('candidate_images', 'public');
        }

        Candidate::create($validated);

        return redirect()->back()->with('success', 'Candidate successfully added!');
    }

    public function update(Request $request, Candidate $candidate)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'party_list' => 'nullable|string|max:255',
            'course_program' => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:50',
            'age' => 'nullable|integer|min:18|max:100',
            'date_of_filling' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $request->only([
            'name',
            'position',
            'party_list',
            'course_program',
            'year_level',
            'age',
            'date_of_filling',
        ]);

        // Handle image update
        if ($request->hasFile('image')) {
            if ($candidate->image) {
                Storage::disk('public')->delete($candidate->image);
            }
            $data['image'] = $request->file('image')->store('candidates', 'public');
        }

        $candidate->update($data);

        return redirect()->back()->with('success', 'Candidate updated successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'candidate_ids' => 'required|array|min:1',
            'candidate_ids.*' => 'exists:candidates,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $candidateIds = $request->candidate_ids;

                // Get candidates with their image paths before deletion
                $candidates = Candidate::whereIn('id', $candidateIds)->get();

                // Delete vote records first (if you have foreign key constraints)
                Vote::whereIn('candidate_id', $candidateIds)->delete();

                // Delete candidates
                $deletedCount = Candidate::whereIn('id', $candidateIds)->delete();

                Log::info("Bulk deleted {$deletedCount} candidates", ['candidate_ids' => $candidateIds]);
            });

            $count = count($request->candidate_ids);

            return back()->with('success', "{$count} candidate".($count > 1 ? 's' : '').' deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Bulk delete failed: '.$e->getMessage());

            return back()->with('error', 'Failed to delete candidates. Please try again.');
        }
    }

    public function importExcel(Request $request)
    {
        // Validate uploaded file
        $request->validate([
            'file' => 'required|mimes:xls,xlsx,csv',
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheetData = $spreadsheet->getActiveSheet()->toArray();

        // Remove header row
        array_shift($sheetData);

        $duplicates = [];
        $errors = [];
        $imported = 0;

        // Check for duplicate candidate names & positions before inserting
        foreach ($sheetData as $index => $row) {
            if (empty($row[0])) {
                continue;
            }

            $name = trim($row[0]);
            $position = trim($row[1]);
            $courseProgram = trim($row[2] ?? '');
            $partyList = trim($row[3] ?? '');
            $dateOfFilling = $row[4] ?? null;
            $yearLevel = trim($row[5] ?? '');
            $age = $row[6] ?? null;

            // Required fields check
            if (empty($name) || empty($position) || empty($partyList) || empty($dateOfFilling)) {
                $errors[] = [
                    'row' => $index + 2,
                    'name' => $name,
                    'position' => $position,
                    'error' => 'Missing required fields (Name, Position, Party List, or Date of Filling)',
                ];

                continue;
            }

            // Check duplicates (same name & position)
            $existingCandidate = Candidate::where('name', $name)
                ->where('position', $position)
                ->first();

            if ($existingCandidate) {
                $duplicates[] = [
                    'row' => $index + 2,
                    'name' => $name,
                    'position' => $position,
                ];
            }
        }

        if (! empty($duplicates)) {
            return redirect()->back()->with([
                'error' => 'Duplicate candidates found. Please review and try again.',
                'duplicates' => $duplicates,
            ]);
        }

        if (! empty($errors)) {
            return redirect()->back()->with([
                'error' => 'Validation errors found in the file.',
                'errors' => $errors,
            ]);
        }

        // Proceed with importing
        foreach ($sheetData as $index => $row) {
            if (empty($row[0])) {
                continue;
            }

            $name = trim($row[0]);
            $position = trim($row[1]);
            $courseProgram = trim($row[2] ?? '');
            $partyList = trim($row[3] ?? '');
            $dateOfFilling = $row[4] ?? null;
            $yearLevel = trim($row[5] ?? '');
            $age = $row[6] ?? null;

            try {
                // Parse date
                if (is_numeric($dateOfFilling) && $dateOfFilling > 0) {
                    $dateOfFilling = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($dateOfFilling)->format('Y-m-d');
                } elseif (! empty($dateOfFilling) && is_string($dateOfFilling)) {
                    $dateOfFilling = date('Y-m-d', strtotime($dateOfFilling));
                } else {
                    $dateOfFilling = null;
                }

                $candidate = new Candidate;
                $candidate->name = $name;
                $candidate->position = $position;
                $candidate->course_program = $courseProgram;
                $candidate->party_list = $partyList;
                $candidate->date_of_filling = $dateOfFilling;
                $candidate->year_level = $yearLevel ?: null;
                $candidate->age = $age ?: null;
                $candidate->image = null; // handle images separately if needed
                $candidate->save();

                $imported++;
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $index + 2,
                    'name' => $name,
                    'position' => $position,
                    'error' => $e->getMessage(),
                ];
            }
        }

        if (! empty($errors)) {
            return redirect()->back()->with([
                'warning' => "Imported {$imported} candidates, but ".count($errors).' failed.',
                'errors' => $errors,
            ]);
        }

        return redirect()->back()->with('success', "Successfully imported {$imported} candidates!");

    }

    // Alternative: Using a Job for bulk delete (for large datasets)
    public function bulkDestroyAsync(Request $request)
    {
        $request->validate([
            'candidate_ids' => 'required|array|min:1',
            'candidate_ids.*' => 'exists:candidates,id',
        ]);

        // Dispatch job for bulk deletion
        BulkDeleteCandidates::dispatch($request->candidate_ids);

        $count = count($request->candidate_ids);

        return back()->with('success', "Deletion of {$count} candidate".($count > 1 ? 's' : '').' has been queued.');
    }

    public function destroy(Candidate $candidate)
    {
        //
    }
}
