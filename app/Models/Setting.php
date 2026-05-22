<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class Setting extends Model
{
    use BelongsToTenant;

    protected $fillable = ['key', 'value', 'type', 'tenant_id'];
}
