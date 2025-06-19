<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bookings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'customer_name',
        'phone_no',
        'travel_date_from',
        'travel_date_to',
        'no_adults',
        'no_children',
        'hotel_info',
        'transport_info',
        'sightseeing_info',
        'remarks',
        'taxes',
        'final_payment',
        'total_per_adult',
        'total_per_child',
        'customer_status',
        'payment_status',
        'created_date',
        'converted_date',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'travel_date_from' => 'date',
        'travel_date_to' => 'date',
        'hotel_info' => 'array',
        'transport_info' => 'array',
        'sightseeing_info' => 'array',
        'taxes' => 'array',
        'created_date' => 'datetime',
        'converted_date' => 'datetime',
    ];

    /**
     * Relationship with the User model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function trasactions()
    {
        return $this->hasMany(Trasaction::class, 'booking_id');
    }
    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id');
    }
    
}
