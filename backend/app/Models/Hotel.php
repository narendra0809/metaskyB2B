<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    // Define the fillable properties for mass assignment
    protected $fillable = [
        'name',
        'hotel_type',
        'address',
        'contact_no',
        'email',
        'destination_id',
        'ex_adult_rate',
        'ex_child_rate',
        'room_types', // Add room_types JSON field
        'meals',      // Add meals JSON field
    ];

    // Cast JSON fields to arrays for easy access and manipulation
    protected $casts = [
        'room_types' => 'array', // Automatically cast JSON to array
        'meals' => 'array',      // Automatically cast JSON to array
    ];

    // Define the relationship with the Destination model
    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }
}
