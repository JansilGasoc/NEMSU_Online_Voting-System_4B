<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bsa extends Model
{
    //
    use HasFactory;

    protected $fillable = ['name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age', 'image'];

    public function getVotesAttribute()
    {
        return $this->bsa_votes()->count();
    }

    public function bsa_votes()
    {
        return $this->hasMany(BsaVote::class);
    }
}
