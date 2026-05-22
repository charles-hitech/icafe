<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class Customer extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'phone',
        'email',
        'loyalty_points',
        'lifetime_points',
        'total_spent',
        'birthday',
        'credit_limit',
        'due_amount',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class)->latest();
    }
}
