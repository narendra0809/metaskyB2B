<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transportation extends Model
{
    protected $table = 'transportations';

    protected $fillable = [
        'destination_id',
        'company_name',
        'company_document',
        'address',
        'transport',
        'vehicle_type',
        'options',
        'terms_and_conditions'
    ];

    protected $casts = [
        'options' => 'array',
        'terms_and_conditions' => 'array',
    ];

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }
}
