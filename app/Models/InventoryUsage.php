<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class InventoryUsage extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'inventory_item_id',
        'quantity_used',
        'usage_date',
        'notes',
    ];

    protected $casts = [
        'usage_date' => 'date',
    ];

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
