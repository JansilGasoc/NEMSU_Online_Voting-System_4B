<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return auth('web')->check() && (int) $user->id === (int) $id;
}, ['guards' => ['web']]);

Broadcast::channel('admin.{id}', function ($admin, $id) {
    return auth('admin')->check() && (int) $admin->id === (int) $id;
}, ['guards' => ['admin']]);
