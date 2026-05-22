<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class StockGroup extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'name',
        'description',
    ];

    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }
}
