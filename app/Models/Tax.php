<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Tax extends Model
{
    use BelongsToTenant;

    use HasFactory;

    protected $fillable = [
        'name',
        'rate',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'rate' => 'decimal:2',
    ];
}
