<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable,HasApiTokens;

    protected $fillable = [
        'username',
        'company_name',
        'phoneno',
        'address',
        'company_documents',
        'company_logo',
        'reffered_by',
        'role',
        'email',
        'password',
        'is_approved',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_approved' => 'boolean', // Add casting for the is_approved column (optional)
        ];
    }

    
    public function bankdetail()
    {
        return $this->hasMany(BankDetail::class);
    }
    
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }
    public function payment()
    {
        return $this->hasMany(Payment::class);
    }
    public function trasaction()
    {
        return $this->hasMany(Trasaction::class);
    }
}


