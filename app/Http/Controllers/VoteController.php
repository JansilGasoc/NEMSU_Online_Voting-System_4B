<?php

namespace App\Http\Controllers;

use App\Events\VoteCasted;
use App\Jobs\RecordVote;
use App\Models\Candidate;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(Request $request)
    {
        $positions = [
            'president',
            'internal_vice_president',
            'external_vice_president',
            'auditor',
            'treasurer',
            'secretary',
        ];

        $validationRules = [
            'senator_ids' => 'array|max:8',
            'senator_ids.*' => 'exists:candidates,id',
        ];

        foreach ($positions as $position) {
            $validationRules["{$position}_id"] = 'nullable|exists:candidates,id';
        }

        $request->validate($validationRules);

        $userId = Auth::id();

        if (Vote::where('user_id', $userId)->exists()) {
            session()->flash('error', 'nag minaru nasab kaha! hahahahah');

            return redirect()->back();
        }

        // Approach 1: Asynchronous with Jobs (Recommended)
        DB::transaction(function () use ($positions, $request, $userId) {
            $candidateIds = [];

            // Process position votes
            foreach ($positions as $position) {
                $candidateIdKey = "{$position}_id";
                if ($request->filled($candidateIdKey)) {
                    $candidateId = $request->$candidateIdKey;
                    $candidateIds[] = $candidateId;

                    // Create vote record immediately
                    Vote::create([
                        'candidate_id' => $candidateId,
                        'user_id' => $userId,
                        'position' => $position,
                    ]);
                }
            }

            // Process senator votes
            if ($request->filled('senator_ids')) {
                foreach ($request->senator_ids as $senatorId) {
                    $candidateIds[] = $senatorId;

                    Vote::create([
                        'candidate_id' => $senatorId,
                        'user_id' => $userId,
                        'position' => 'senator',
                    ]);
                }
            }

            // Dispatch jobs to update vote counts asynchronously
            $candidateCounts = collect($candidateIds)->countBy();
            foreach ($candidateCounts as $candidateId => $count) {
                RecordVote::dispatch($candidateId, $count);
            }
        });

        session()->flash('success', 'Your vote has been recorded successfully.');

        return redirect()->back();
    }

    private function recordVote($candidateId, $userId, $position)
    {
        $candidate = Candidate::find($candidateId);

        if ($candidate) {
            $lock = Cache::lock("vote_lock_{$candidateId}", 10);

            if ($lock->get()) {
                try {
                    $candidate->increment('votes');

                    $vote = Vote::create([
                        'candidate_id' => $candidate->id,
                        'user_id' => $userId,
                        'position' => $position,
                    ]);

                    // ✅ Broadcast only the updated candidate
                    broadcast(new VoteCasted($candidate));
                } finally {
                    $lock->release();
                }
            }
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Vote $vote)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vote $vote)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vote $vote)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vote $vote)
    {
        //
    }
}
