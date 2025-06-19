<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class BankDetail extends Model
{
    protected $table ="bankdetails";
    protected $fillable = [
        'user_id',
        'account_details',
        'upi_id',
        'bank_name',
        'account_holder_name',
        'ifsc_code',
        'account_type',
        'branch',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}