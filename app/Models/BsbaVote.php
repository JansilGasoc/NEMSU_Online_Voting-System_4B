<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BsbaVote extends Model
{
    //
    use HasFactory;

    protected $fillable = ['bsba_id', 'user_id', 'position'];

    public function candidate()
    {
        return $this->belongsTo(Bsba::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
