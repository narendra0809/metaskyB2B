<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sightseeing extends Model
{
    protected $table ="sightseeings";
    protected $fillable = [
        'destination_id',
        'company_name',
        'address',
        'description',
        'sharing_transfer_adult',
        'sharing_transfer_child',
        'rate_adult',
        'rate_child',
        'terms_and_conditions'
    ];

     protected $casts = [
        'terms_and_conditions' => 'array',
    ];

    // Define relationship with Destination model
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }
}
