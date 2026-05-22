<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class Reservation extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'table_id', 'customer_name', 'phone', 'booking_time', 'status', 'guests_count'];

    protected $casts = [
        'booking_time' => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
}
