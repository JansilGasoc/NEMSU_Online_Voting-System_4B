<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bscte extends Model
{
    //
    use HasFactory;

    protected $fillable = ['name', 'position', 'course_program', 'party_list', 'date_of_filling', 'year_level', 'age', 'image'];

    public function getVotesAttribute()
    {
        return $this->bscte_votes()->count();
    }

    public function bscte_votes()
    {
        return $this->hasMany(BscteVote::class);
    }
}
