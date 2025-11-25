<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BsaVote extends Model
{
    //
    use HasFactory;

    protected $fillable = ['bsa_id', 'user_id', 'position'];

    public function candidate()
    {
        return $this->belongsTo(Bsa::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
