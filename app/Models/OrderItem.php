<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_id', 
        'menu_id', 
        'quantity', 
        'price',
        'is_redeemed',
        'points_cost',
        'kds_status',
        'started_at',
        'finished_at',
        'delivered_at'
    ];
    
    protected $casts = [
        'started_at'   => 'datetime',
        'finished_at'  => 'datetime',
        'delivered_at' => 'datetime',
        'is_redeemed'  => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function addons()
    {
        return $this->belongsToMany(Addon::class, 'order_item_addons')
            ->withPivot('addon_name', 'price')
            ->withTimestamps();
    }
}
