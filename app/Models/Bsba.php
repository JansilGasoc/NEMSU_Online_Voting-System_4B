<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bsba extends Model
{
    //
    use HasFactory;

    protected $fillable = ['name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age', 'image'];

    public function getVotesAttribute()
    {
        return $this->bsba_votes()->count();
    }

    public function bsba_votes()
    {
        return $this->hasMany(BsbaVote::class);
    }
}
