<?php

namespace App\Jobs;

use App\Events\VoteCasted;
use App\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecordVote implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $candidateId;

    // Job configuration
    public $tries = 3;
    public $backoff = [1, 5, 10]; // Retry after 1, 5, 10 seconds
    public $timeout = 30;

    public function __construct($candidateId)
    {
        $this->candidateId = $candidateId;
    }

    public function handle()
    {
        $candidate = Candidate::find($this->candidateId);

        if (!$candidate) {
            Log::warning("Candidate not found for vote recording: {$this->candidateId}");
            return;
        }

        // Use cache lock to prevent race conditions
        $lock = Cache::lock("vote_count_lock_{$this->candidateId}", 10);

        if ($lock->get()) {
            try {
                // Increment vote count
                $candidate->increment('votes');

                // Refresh the model to get updated data
                $candidate->refresh();

                // Broadcast the vote update
                broadcast(new VoteCasted($candidate));

                Log::info("Vote recorded for candidate {$this->candidateId}. New count: {$candidate->votes}");
            } catch (\Exception $e) {
                Log::error("Failed to record vote for candidate {$this->candidateId}: " . $e->getMessage());
                throw $e; // Re-throw to trigger retry
            } finally {
                $lock->release();
            }
        } else {
            Log::warning("Could not acquire lock for candidate {$this->candidateId}");
            throw new \Exception("Lock acquisition failed"); // Trigger retry
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error("RecordVote job failed permanently for candidate {$this->candidateId}: " . $exception->getMessage());
    }
}
