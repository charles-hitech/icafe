<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

class MeasuringUnit extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'name',
        'short_name',
    ];

    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }
}
