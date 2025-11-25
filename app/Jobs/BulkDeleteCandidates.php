<?php

namespace App\Jobs;

use App\Models\Candidate;
use App\Models\Vote;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BulkDeleteCandidates implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $candidateIds;

    public $tries = 3;
    public $timeout = 120; // 2 minutes for large batches

    public function __construct(array $candidateIds)
    {
        $this->candidateIds = $candidateIds;
    }

    public function handle()
    {
        try {
            DB::transaction(function () {
                // Delete related votes
                Vote::whereIn('candidate_id', $this->candidateIds)->delete();

                // Delete candidates
                $deletedCount = Candidate::whereIn('id', $this->candidateIds)->delete();

                Log::info("Bulk deleted {$deletedCount} candidates via job", [
                    'candidate_ids' => $this->candidateIds
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Bulk delete job failed: ' . $e->getMessage(), [
                'candidate_ids' => $this->candidateIds
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error('BulkDeleteCandidates job failed permanently: ' . $exception->getMessage(), [
            'candidate_ids' => $this->candidateIds
        ]);
    }
}
