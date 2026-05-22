<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class InventoryPurchase extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'inventory_item_id',
        'supplier_id',
        'quantity',
        'unit_price',
        'total_price',
        'purchase_date',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
    ];

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
