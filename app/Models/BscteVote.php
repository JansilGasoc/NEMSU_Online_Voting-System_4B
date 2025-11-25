<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BscteVote extends Model
{
    //
    use HasFactory;

    protected $fillable = ['bscte_id', 'user_id', 'position'];

    public function candidate()
    {
        return $this->belongsTo(Bscte::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
