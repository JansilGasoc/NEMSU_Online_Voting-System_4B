<?php

use App\Models\Election;
use Illuminate\Support\Facades\Route;

Route::get('/election/status', function () {
    $election = Election::latest()->first();

    return response()->json(['status' => $election->status]);
});
