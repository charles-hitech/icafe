<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class Category extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'status'];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }
}
