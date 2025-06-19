<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trasaction extends Model
{
    // Define the fillable attributes for mass assignment
    protected $fillable = [
        'user_id',
        'amount',
        'payment_date',
        'payment_status',
        'mode',
        'status',
        'booking_id',
    ];

    /**
     * Relationship with the User model
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship with the Booking model
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class,'wallet_id');
    }
}
