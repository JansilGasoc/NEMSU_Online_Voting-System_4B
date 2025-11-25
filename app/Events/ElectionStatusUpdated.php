<?php

namespace App\Events;

use App\Models\Election;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class ElectionStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $elections;

    public function __construct($elections)
    {
        // Fetch the latest election

        $this->elections = Election::select('id', 'election_name', 'status')->get();
    }

    public function broadcastOn()
    {
        return new Channel('election-channel'); // Broadcast publicly
    }
    public function broadcastWith()
    {
        $elections = \App\Models\Election::where('status', 'Started')->get();

        return [
            'elections' => $elections->map(function ($election) {
                return [
                    'election_name' => $election->name,
                    'status' => $election->status, // Ensure this is sent
                ];
            }),
        ];
    }
}
