<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    //
    use HasFactory;

    protected $table = 'candidates';

    protected $fillable = ['name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age', 'votes', 'image'];

    public function getVotesAttribute()
    {
        // Assuming you have a votes relationship
        return $this->votes()->count();
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}
