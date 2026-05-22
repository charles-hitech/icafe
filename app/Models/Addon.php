<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class Addon extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'price', 'status'];

    protected $casts = [
        'status' => 'boolean',
        'price' => 'decimal:2',
    ];
}
