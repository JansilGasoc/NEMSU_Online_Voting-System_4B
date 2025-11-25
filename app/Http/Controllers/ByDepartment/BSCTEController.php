<?php

namespace App\Http\Controllers\ByDepartment;

use App\Http\Controllers\Controller;
use App\Models\Bscte;
use App\Models\BscteVote;
use App\Models\Election;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BSCTEController extends Controller
{
    // client side

    public function voterView()
    {
        $candidates = Bscte::all();

        // Cache the elections data for 60 minutes
        $election = Election::latest()->first();

        return Inertia::render('Auth/bscte', [
            'candidates' => $candidates,
            'election' => $election ?: null,
        ]);
    }

    // store vote
    public function store(Request $request)
    {
        $singleVotePositions = [
            'governor',
            'vp_internal',
            'vp_external',
            'secretary',
            'asst_secretary',
            'treasurer',
            'asst_treasurer',
            'auditor',
            'layout_artist',
            'online_convener',
            'ambassador',
            'ambassadress',
        ];

        // Multi-select positions (choose 2 each)
        $multiVotePositions = [
            'p_i_o' => 2,
            'business_manager' => 2,
            'sergeant_at_arms' => 2,
        ];

        $validationRules = [];

        // Validate single-select positions
        foreach ($singleVotePositions as $position) {
            $validationRules["{$position}_id"] = 'nullable|exists:bsctes,id';
        }

        // Validate multi-select positions
        foreach ($multiVotePositions as $position => $limit) {
            $validationRules[$position] = "nullable|array|max:$limit";
            $validationRules["{$position}.*"] = 'exists:bsctes,id';
        }

        $request->validate($validationRules);

        $userId = Auth::id();
        if (BscteVote::where('user_id', $userId)->exists()) {
            return redirect()->back()->with('error', 'You can vote only once.');
        }

        DB::transaction(function () use ($request, $userId, $singleVotePositions, $multiVotePositions) {
            // Save single-select votes
            foreach ($singleVotePositions as $position) {
                $key = "{$position}_id";
                if ($request->has($key)) {
                    $this->recordVote($request->$key, $userId, $position);
                }
            }

            // Save multi-select votes
            foreach ($multiVotePositions as $position => $limit) {
                if ($request->has($position)) {
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
        $candidate = Bscte::findOrFail($candidateId);

        $lock = Cache::lock("vote_lock_{$candidateId}", 10);

        if (! $lock->get()) {
            throw new \Exception('Could not process your vote at the moment. Please try again later.');
        }
        try {
            $candidate->increment('bscte_votes');

            $cacheKey = "candidate_bscte_vote_count_{$candidateId}";
            if (! Cache::has($cacheKey)) {
                Cache::put($cacheKey, 0, 3600);
            }
            Cache::increment($cacheKey, 1);

            BscteVote::create([
                'bscte_id' => $candidate->id,
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
        $candidates = Bscte::withCount('bscte_votes')
            ->orderBy('bscte_votes_count', 'desc')
            ->get();

        // Get the total number of candidates
        $candidatesCount = Bscte::count();

        // Get the total number of users
        $usersCount = User::count();

        // Get the total number of voted users
        $votedUsersCount = BscteVote::distinct('user_id')->count('user_id');

        // Get all elections
        $election = Election::latest()->first();

        // Pass the data to the view
        return Inertia::render('admin/Bscte', [
            'candidates' => $candidates,
            'candidatesCount' => $candidatesCount,
            'usersCount' => $usersCount,
            'votedUsersCount' => $votedUsersCount,
            'election' => $election ?: null,
        ]);
    }

    public function updatebscte(Request $request, $id)
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

        $bsctecandidate = Bscte::findOrFail($id);

        $data = $request->only('name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('bscte_candidate_images', 'public');
        }

        // Only update changed fields
        $bsctecandidate->update($data);

        session()->flash('success', 'Candidate updated successfully!');

        return redirect()->back();
    }

    public function storebscte(Request $request)
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

        $imagePath = $request->file('image')->store('bscte_candidate_images', 'public');

        //  Use the model, not the controller class
        Bscte::create([
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

    public function destroybscte($id)
    {
        $candidate = Bscte::findOrFail($id);
        // Delete image from storage
        if ($candidate->image) {
            Storage::disk('public')->delete($candidate->image);
        }
        $candidate->delete();

        return redirect()->back()->with('success', 'Candidate deleted successfully!');
    }

    public function deleteAll()
    {
        DB::table('bscte_votes')->delete();
        DB::table('bsctes')->delete();

        return redirect()->back()->with('success', 'Candidate Deleted successfully!');
    }
}
