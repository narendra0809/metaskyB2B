<?php
// app/Models/Ticket.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

  protected $fillable = [
    'name',
    'category',
    'status',
    'time_slots',
    'terms_and_conditions',
];

protected $casts = [
    'category' => 'array',
    'time_slots' => 'array',
    'terms_and_conditions' => 'array',
];

}
