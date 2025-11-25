<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BshmVote extends Model
{
    //
    use HasFactory;

    protected $fillable = ['bshm_id', 'user_id', 'position'];

    public function candidate()
    {
        return $this->belongsTo(Bshm::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
