<?php

namespace App\Http\Controllers\ByDepartment;

use App\Http\Controllers\Controller;
use App\Models\Bsa;
use App\Models\BsaVote;
use App\Models\Election;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BSAController extends Controller
{
    //
    public function voterView()
    {
        $candidates = Bsa::all();

        // Cache the elections data for 60 minutes
        $election = Election::latest()->first();

        return Inertia::render('Auth/bsa', [
            'candidates' => $candidates,
            'election' => $election ?: null,
        ]);
    }

    public function store(Request $request)
    {
        $positions = [
            'governor',
            'vp_governor_int',
            'vp_governor_ext',
            'secretary',
            'asst_secretary',
            'treasurer',
            'asst_treasurer',
            'auditor',
            'asst_auditor',
            'p_i_o',
            'asst_p_i_o',
            'photo_journalist',
        ];

        $validationRules = [];
        foreach ($positions as $position) {
            $validationRules["{$position}_id"] = 'nullable|exists:bsas,id';
        }

        $request->validate($validationRules);

        $userId = Auth::id();
        if (BsaVote::where('user_id', $userId)->exists()) {
            return redirect()->back()->with('error', 'You can vote only once.');
        }

        try {
            DB::transaction(function () use ($positions, $request, $userId) {
                foreach ($positions as $position) {
                    $candidateIdKey = "{$position}_id";
                    if ($request->filled($candidateIdKey)) {
                        $this->recordVote($request->$candidateIdKey, $userId, $position);
                    }
                }
            });

            return redirect()->back()->with('success', 'Your vote has been recorded successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    private function recordVote($candidateId, $userId, $position)
    {
        $candidate = Bsa::findOrFail($candidateId);

        $lock = Cache::lock("vote_lock_{$candidateId}", 10);

        if (! $lock->get()) {
            throw new \Exception('Could not process your vote at the moment. Please try again later.');
        }
        try {
            $candidate->increment('bsa_votes');

            $cacheKey = "candidate_bsa_vote_count_{$candidateId}";
            if (! Cache::has($cacheKey)) {
                Cache::put($cacheKey, 0, 3600);
            }
            Cache::increment($cacheKey, 1);

            BsaVote::create([
                'bsa_id' => $candidate->id,
                'user_id' => $userId,
                'position' => $position,
            ]);
        } finally {
            $lock->release();
        }
    }
    // Admin Side

    public function view()
    {
        $candidates = Bsa::withCount('bsa_votes')
            ->orderBy('bsa_votes_count', 'desc')
            ->get();

        // Get the total number of candidates
        $candidatesCount = Bsa::count();

        // Get the total number of users
        $usersCount = User::count();

        // Get the total number of voted users
        $votedUsersCount = BsaVote::distinct('user_id')->count('user_id');

        // Get all elections
        $election = Election::latest()->first();

        // Pass the data to the view
        return Inertia::render('admin/Bsa', [
            'candidates' => $candidates,
            'candidatesCount' => $candidatesCount,
            'usersCount' => $usersCount,
            'votedUsersCount' => $votedUsersCount,
            'election' => $election ?: null,
        ]);
    }

    public function updatebsa(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'course_program' => 'required|string|max:255',
            'party_list' => 'required|string|max:255',
            'date_of_filling' => 'required|date',
            'year_level' => 'string|max:255',
            'age' => 'integer',
            'image' => 'nullable|image|max:10240', // allow image
        ]);

        $bsacandidate = Bsa::findOrFail($id);

        $data = $request->only('name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('bsa_candidate_images', 'public');
        }

        $bsacandidate->update($data);

        session()->flash('success', 'Candidate updated successfully!');

        return redirect()->back();
    }

    public function storebsa(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'course_program' => 'required|string|max:255',
            'party_list' => 'required|string|max:255',
            'date_of_filling' => 'required|date',
            'year_level' => 'string|max:255',
            'age' => 'integer',
            'image' => 'required|image|max:10240', // allow image
        ]);

        $imagePath = $request->file('image')->store('bsa_candidate_images', 'public');

        //  Use the model, not the controller class
        Bsa::create([
            'name' => $request->name,
            'position' => $request->position,
            'course_program' => $request->course_program,
            'party_list' => $request->party_list,
            'date_of_filling' => $request->date_of_filling,
            'year_level' => $request->year_level,
            'age' => $request->age,
            'image' => $imagePath,
        ]);

        return redirect()->back()->with('success', 'Candidate added successfully!');
    }

    public function destroybsa($id)
    {
        $candidate = Bsa::findOrFail($id);
        // Delete image from storage
        if ($candidate->image) {
            Storage::disk('public')->delete($candidate->image);
        }
        $candidate->delete();

        return redirect()->back()->with('success', 'Candidate deleted successfully!');
    }

    public function deleteAll()
    {
        DB::table('bsa_votes')->delete();
        DB::table('bsas')->delete();

        return redirect()->back()->with('success', 'Candidate Deleted successfully!');
    }
}
