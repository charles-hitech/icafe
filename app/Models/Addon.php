<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'price', 'status'];

    protected $casts = [
        'status' => 'boolean',
        'price' => 'decimal:2',
    ];
}
