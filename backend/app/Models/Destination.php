<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    protected $fillable = ['name', 'country_id', 'state_id', 'city_id', 'status'];



    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function hotels()
    {
        return $this->hasMany(Hotel::class);
    }

    public function sightseeings()
    {
        return $this->hasMany(Sightseeing::class);
    }

    public function transportations()
    {
        return $this->hasMany(Transportation::class);
    }
}
