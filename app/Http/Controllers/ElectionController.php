<?php

namespace App\Http\Controllers;

use App\Events\ElectionStatusUpdated;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ElectionController extends Controller
{
    //

    public function store(Request $request, Election $election)
    {
        $request->validate([
            'election_name' => 'required|string|max:255',
            'status' => 'in:Started,Paused',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
        ]);

        $election = Election::create([
            'election_name' => $request->election_name,
            'status' => $request->status ?? 'Started',
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        event(new ElectionStatusUpdated($election));

        return back()->with('success', 'Election created successfully!');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Started,Paused',
        ]);

        $election = Election::findOrFail($id);
        $election->update(['status' => $request->status]);
        broadcast(new ElectionStatusUpdated(Election::where('status', 'Started')->get()));

        return redirect()->back();
    }

    public function close(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:elections,id',
        ]);

        $election = Election::find($request->id);

        if ($election) {
            $election->update(['status' => 'Paused']);
        }

        return back()->with('success', 'Election closed automatically after countdown.');
    }

    public function destroy(Request $request, $id)
    {
        $request->validate([
            'password' => 'required',
        ]);

        if (! Hash::check($request->password, Auth::guard('admin')->user()->password)) {
            return back()->withErrors(['password' => 'The provided password is incorrect.']);
        }

        $election = Election::findOrFail($id);
        $election->delete();

        return redirect()->back()->with('success', 'Election deleted successfully.');
    }

    public function liveTally()
    {
        $positions = [
            'president',
            'external_vice_president',
            'internal_vice_president',
            'secretary',
            'treasurer',
            'auditor',
            'senator',
        ];
        $voted_users_count = Vote::distinct('user_id')->count('user_id');

        // Or if you need the actual user records:
        $voted_users = User::whereHas('votes')->get();
        $voted_users_count = $voted_users->count();
        $candidates = Candidate::select('id', 'name', 'position')
            ->withCount('votes')
            ->get();
        $candidates_count = Candidate::count();
        $election = Election::latest()->first();

        return Inertia::render('LiveTally', [
            'candidates_count' => $candidates_count,
            'voted_users' => $voted_users,
            'voted_users_count' => $voted_users_count, // The count
            'candidates' => $candidates,
            'positions' => $positions,
            'election' => $election ? [
                'election_name' => $election->election_name,
                'status' => $election->status,
                'start_time' => $election->start_time,
                'end_time' => $election->end_time,
            ] : null,
        ]);
    }

    public function results()
    {

        $candidates = Candidate::withCount('votes')->get();
        $users = User::all();
        $election = Election::latest()->first();

        return Inertia::render('Result', [
            'candidates' => $candidates,
            'users' => $users,
            'election' => $election ? [
                'status' => $election->status,
                'start_time' => $election->start_time,
                'end_time' => $election->end_time,
            ] : null,
        ]);

    }
}
