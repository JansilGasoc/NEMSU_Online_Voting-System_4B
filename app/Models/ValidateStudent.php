<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class ValidateStudent extends Model
{
    //
    use HasFactory, Notifiable;

    protected $table = 'validate_students';

    protected $fillable = [
        'student_id',
        'last_name',
        'first_name',
        'middle_name',
        'ext_name',
        'sex',
        'course',
        'major',
        'year_level',
        'birth_date',
        'used',
    ];
}
