<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BscsVote extends Model
{
    //
    use HasFactory;

    protected $fillable = ['bscs_id', 'user_id', 'position'];

    public function candidate()
    {
        return $this->belongsTo(Bscs::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
