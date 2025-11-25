<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bscs extends Model
{
    //

    use HasFactory;

    protected $fillable = ['name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age', 'image'];

    public function getVotesAttribute()
    {

        return $this->bscs_votes()->count();
    }

    public function bscs_votes()
    {
        return $this->hasMany(BscsVote::class);
    }
}
