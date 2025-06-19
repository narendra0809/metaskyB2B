<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{

    protected $fillable = ['user_id', 'balance','details','screenshot'];


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
