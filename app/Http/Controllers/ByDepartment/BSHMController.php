<?php

namespace App\Http\Controllers\ByDepartment;

use App\Http\Controllers\Controller;
use App\Models\Bshm;
use App\Models\BshmVote;
use App\Models\Election;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BSHMController extends Controller
{
    //
    public function voterView()
    {
        $candidates = Bshm::all();

        // Cache the elections data for 60 minutes
        $election = Election::latest()->first();

        return Inertia::render('Auth/bshm', [
            'candidates' => $candidates,
            'election' => $election ?: null,
        ]);
    }

    public function store(Request $request)
    {
        $singleVotePositions = [
            'governor',
            'vp_governor_int',
            'vp_governor_ext',
            'secretary',
            'treasurer',
            'auditor',
            'p_i_o',
            'dept_ambassador',
            'dept_ambassadress',
            'sgt_at_arms',
            'fourth_year_representative',
            'second_year_representative',
        ];

        $multiVotePositions = [
            'third_year_representative' => 2, // Allow up to 2 selections
        ];

        $validationRules = [];

        // Single-vote validation
        foreach ($singleVotePositions as $position) {
            $validationRules["{$position}_id"] = 'nullable|exists:bshms,id';
        }

        // Multi-vote validation
        foreach ($multiVotePositions as $position => $limit) {
            $validationRules[$position] = "nullable|array|min:1|max:$limit";
            $validationRules["{$position}.*"] = 'exists:bshms,id';
        }

        $request->validate($validationRules);

        $userId = Auth::id();
        if (BshmVote::where('user_id', $userId)->exists()) {
            return redirect()->back()->with('error', 'You can vote only once.');

            return redirect()->back();
        }

        DB::transaction(function () use ($request, $singleVotePositions, $multiVotePositions, $userId) {
            // Store single-vote positions
            foreach ($singleVotePositions as $position) {
                $key = "{$position}_id";
                if ($request->has($key)) {
                    $this->recordVote($request->$key, $userId, $position);
                }
            }

            // Store multi-vote positions
            foreach ($multiVotePositions as $position => $limit) {
                if ($request->has($position) && is_array($request->$position)) {
                    foreach ($request->$position as $candidateId) {
                        $this->recordVote($candidateId, $userId, $position);
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Your vote has been recorded successfully.');
    }

    private function recordVote($candidateId, $userId, $position)
    {
        $candidate = Bshm::findOrFail($candidateId);

        $lock = Cache::lock("vote_lock_{$candidateId}", 10);

        if (! $lock->get()) {
            throw new \Exception('Could not process your vote at the moment. Please try again later.');
        }
        try {
            $candidate->increment('bshm_votes');

            $cacheKey = "candidate_bshm_vote_count_{$candidateId}";
            if (! Cache::has($cacheKey)) {
                Cache::put($cacheKey, 0, 3600);
            }
            Cache::increment($cacheKey, 1);

            BshmVote::create([
                'bshm_id' => $candidate->id,
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
        $candidates = Bshm::withCount('bshm_votes')
            ->orderBy('bshm_votes_count', 'desc')
            ->get();

        // Get the total number of candidates
        $candidatesCount = Bshm::count();

        // Get the total number of users
        $usersCount = User::count();

        // Get the total number of voted users
        $votedUsersCount = BshmVote::distinct('user_id')->count('user_id');

        // Get all elections
        $election = Election::latest()->first();

        // Pass the data to the view
        return Inertia::render('admin/Bshm', [
            'candidates' => $candidates,
            'candidatesCount' => $candidatesCount,
            'usersCount' => $usersCount,
            'votedUsersCount' => $votedUsersCount,
            'election' => $election ?: null,
        ]);
    }

    public function updatebshm(Request $request, $id)
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

        $bshmcandidate = Bshm::findOrFail($id);

        $data = $request->only('name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('bshm_candidate_images', 'public');
        }

        // Only update changed fields
        $bshmcandidate->update($data);

        session()->flash('success', 'Candidate updated successfully!');

        return redirect()->back();
    }

    public function storebshm(Request $request)
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

        $imagePath = $request->file('image')->store('bshm_candidate_images', 'public');

        //  Use the model, not the controller class
        Bshm::create([
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

    public function destroybshm($id)
    {
        $candidate = Bshm::findOrFail($id);
        // Delete image from storage
        if ($candidate->image) {
            Storage::disk('public')->delete($candidate->image);
        }
        $candidate->delete();

        return redirect()->back()->with('success', 'Candidate deleted successfully!');
    }

    public function deleteAll()
    {
        DB::table('bshm_votes')->delete();
        DB::table('bshms')->delete();

        return redirect()->back()->with('success', 'Candidate Deleted successfully!');
    }
}
