<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use BelongsToTenant;
    
    protected static function booted()
    {
        static::creating(function ($order) {
            // Generate a readable order number if not set
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
        
        static::created(function ($order) {
            // When an order is created, mark the table as occupied
            if ($order->table_id) {
                \App\Models\Table::withoutGlobalScopes()
                    ->where('id', $order->table_id)
                    ->update(['status' => 'occupied']);
            }
        });

        static::updated(function ($order) {
            // If the order status changes, sync the table status
            if ($order->isDirty('status') || $order->isDirty('table_id')) {
                if (in_array($order->status, ['completed', 'cancelled'])) {
                    \App\Models\Table::withoutGlobalScopes()
                        ->where('id', $order->table_id)
                        ->update(['status' => 'available']);
                } else {
                    \App\Models\Table::withoutGlobalScopes()
                        ->where('id', $order->table_id)
                        ->update(['status' => 'occupied']);
                }
                
                // If the table_id changed, the old table should be checked/freed
                if ($order->isDirty('table_id')) {
                    $oldTableId = $order->getOriginal('table_id');
                    if ($oldTableId) {
                        // Check if there are any other active orders for the old table
                        $hasActiveOrders = \App\Models\Order::where('table_id', $oldTableId)
                            ->whereNotIn('status', ['completed', 'cancelled'])
                            ->exists();
                        
                        if (!$hasActiveOrders) {
                            \App\Models\Table::withoutGlobalScopes()
                                ->where('id', $oldTableId)
                                ->update(['status' => 'available']);
                        }
                    }
                }
            }
        });

        static::deleting(function ($order) {
            // When an order is deleted (cancelled), ensure the table becomes available
            // ONLY if there are no other active orders for this table
            if ($order->table_id) {
                // Check if there are any other active orders for this table
                $hasOtherActiveOrders = \App\Models\Order::withoutGlobalScopes()
                    ->where('table_id', $order->table_id)
                    ->where('id', '!=', $order->id)
                    ->whereNotIn('status', ['completed', 'cancelled'])
                    ->exists();

                if (!$hasOtherActiveOrders) {
                    \App\Models\Table::withoutGlobalScopes()
                        ->where('id', $order->table_id)
                        ->update(['status' => 'available']);
                }
            }
        });
    }

    protected $fillable = [
        'tenant_id',
        'order_number',
        'table_id', 
        'customer_id',
        'waiter_id',
        'status', 
        'total_amount',
        'discount_percentage',
        'discount_amount',
        'points_redeemed',
        'tip_amount', 
        'tax_amount',
        'grand_total', 
        'points_earned',
        'cash_amount', 
        'online_amount',
        'credit_amount',
        'due_payment_amount',
        'payment_method'
    ];
    
    /**
     * Generate a unique, readable order number
     */
    protected static function generateOrderNumber()
    {
        // Get today's date in YYMMDD format
        $date = date('ymd');
        
        // Count today's orders to get sequence number
        $todayStart = \Carbon\Carbon::today()->startOfDay();
        $todayCount = self::where('created_at', '>=', $todayStart)->count();
        
        // Generate order number: ORD-YYMMDD-XXXX
        $sequence = str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
        
        return "ORD-{$date}-{$sequence}";
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function waiter()
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }
}
