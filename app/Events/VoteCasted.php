<?php

namespace App\Events;

use App\Models\Candidate;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoteCasted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $candidate;

    public function __construct(Candidate $candidate)
    {
        // Always include votes_count
        $this->candidate = $candidate->loadCount('votes');
    }

    public function broadcastOn()
    {
        return new Channel('votes');
    }

    public function broadcastAs()
    {
        return 'vote.casted';
    }
}
