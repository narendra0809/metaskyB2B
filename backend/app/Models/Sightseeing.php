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
        'rate_adult',
        'rate_child',
    ];

    // Define relationship with Destination model
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }
}
