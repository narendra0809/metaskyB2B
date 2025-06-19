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
    'transfer_options',
    'time_slots',
];

protected $casts = [
    'transfer_options' => 'array',
    'time_slots' => 'array',
];

}
