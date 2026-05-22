<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Menu;
use App\Models\Table;
use App\Models\ActivityLog;
use App\Models\CreditTransaction;

class OrderController extends Controller
{
    public function kds()
    {
        // Fetch all pending/preparing items with their relations (MongoDB compatible)
        $items = OrderItem::with([
                'order', 
                'order.table', 
                'menu', 
                'addons'
            ])
            ->oldest('created_at')
            ->get();

        // Filter for pending/preparing items, treating null/missing kds_status as 'pending'
        // Also filter out completed/cancelled orders
        $items = $items->filter(function($item) {
            if (!$item->order || in_array($item->order->status, ['completed', 'cancelled'])) {
                return false;
            }
            $status = $item->kds_status ?? 'pending';
            return in_array($status, ['pending', 'preparing']);
        })->values();

        // Ensure kds_status is set for display
        $items = $items->map(function($item) {
            if (!isset($item->kds_status) || $item->kds_status === null) {
                $item->kds_status = 'pending';
            }
            return $item;
        });

        $warningMins = (int)(\App\Models\Setting::where('key', 'kds_warning_mins')->first()?->value ?? 10);
        $criticalMins = (int)(\App\Models\Setting::where('key', 'kds_critical_mins')->first()?->value ?? 20);

        return inertia('Orders/KDS', [
            'items' => $items,
            'kds_warning_mins' => $warningMins,
            'kds_critical_mins' => $criticalMins,
        ]);
    }

    public function updateItemStatus(Request $request, OrderItem $item)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,delivered'
        ]);

        $item->kds_status = $validated['status'];
        
        if ($validated['status'] === 'preparing' && !$item->started_at) {
            $item->started_at = now();
        }
        
        if ($validated['status'] === 'ready' && !$item->finished_at) {
            $item->finished_at = now();
        }

        if ($validated['status'] === 'delivered' && !$item->delivered_at) {
            $item->delivered_at = now();
        }

        $item->save();

        ActivityLog::record('updated', "Order item #{$item->id} ({$item->menu->name}) status updated to {$item->kds_status}", $item->order);

        // Auto-update order status based on item statuses
        $order = $item->order;
        $nonDelivered = $order->items()->whereNotIn('kds_status', ['delivered'])->count();
        $readyCount   = $order->items()->where('kds_status', 'ready')->count();
        $preparingCount = $order->items()->where('kds_status', 'preparing')->count();

        if ($nonDelivered === 0) {
            // All items delivered — mark order as served
            $order->update(['status' => 'served']);
        } elseif ($readyCount > 0 || $preparingCount > 0) {
            if ($preparingCount > 0) {
                $order->update(['status' => 'preparing']);
            }
        }

        return back()->with('success', 'Item status updated.');
    }

    public function serviceView()
    {
        // Load all active (non-completed) orders with items and relations (MongoDB compatible)
        $orders = Order::with([
                'table', 
                'items',
                'items.menu', 
                'items.addons', 
                'customer'
            ])
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->latest('updated_at')
            ->get();

        // Group by table for the waiter view
        $tables = $orders->groupBy('table_id')->map(function ($tableOrders) {
            $table = $tableOrders->first()->table;
            $allItems = $tableOrders->flatMap(fn($o) => $o->items->map(fn($i) => array_merge($i->toArray(), [
                'order_id'     => $o->id,
                'order_number' => $o->order_number,
                'order_status' => $o->status,
                // Ensure kds_status has a default value if not set
                'kds_status'   => $i->kds_status ?? 'pending',
            ])));

            return [
                'table'      => $table,
                'orders'     => $tableOrders->values(),
                'remaining'  => $allItems->whereIn('kds_status', ['pending', 'preparing'])->values(),
                'ready'      => $allItems->where('kds_status', 'ready')->values(),
                'delivered'  => $allItems->where('kds_status', 'delivered')->values(),
            ];
        })->values();

        return inertia('Orders/ServiceView', [
            'tables' => $tables,
        ]);
    }

    public function index(Request $request)
    {
        $baseQuery = \App\Models\Order::query();
        $filter = $request->input('filter', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $status = $request->input('status', 'all');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        // Whitelist sortable columns
        $allowedSorts = ['created_at', 'order_number', 'status', 'grand_total'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        $sortDir = $sortDir === 'asc' ? 'asc' : 'desc';

        switch($filter) {
            case 'today':
                $baseQuery->whereDate('created_at', \Carbon\Carbon::today());
                break;
            case 'yesterday':
                $baseQuery->whereDate('created_at', \Carbon\Carbon::yesterday());
                break;
            case 'week':
                $baseQuery->whereBetween('created_at', [\Carbon\Carbon::now()->startOfWeek(), \Carbon\Carbon::now()->endOfWeek()]);
                break;
            case 'month':
                $baseQuery->whereMonth('created_at', \Carbon\Carbon::now()->month)
                      ->whereYear('created_at', \Carbon\Carbon::now()->year);
                break;
            case 'custom':
                if ($startDate && $endDate) {
                    $baseQuery->whereBetween('created_at', [
                        \Carbon\Carbon::parse($startDate)->startOfDay(),
                        \Carbon\Carbon::parse($endDate)->endOfDay()
                    ]);
                }
                break;
            case 'all':
            default:
                break;
        }

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'active' => (clone $baseQuery)->whereNotIn('status', ['completed', 'cancelled'])->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'cancelled' => (clone $baseQuery)->where('status', 'cancelled')->count(),
        ];

        $query = clone $baseQuery;
        $query->with(['table', 'items.menu', 'customer']);

        if ($status === 'active') {
            $query->whereNotIn('status', ['completed', 'cancelled']);
        } elseif ($status === 'completed') {
            $query->where('status', 'completed');
        } elseif ($status === 'cancelled') {
            $query->where('status', 'cancelled');
        }

        $orders = $query->orderBy($sortBy, $sortDir)->paginate(10)->withQueryString();

        return inertia('Orders/Index', [
            'orders' => $orders,
            'counts' => $counts,
            'filters' => [
                'filter'     => $filter,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'status'     => $status,
                'sort_by'    => $sortBy,
                'sort_dir'   => $sortDir,
            ]
        ]);
    }

    public function show(\App\Models\Order $order)
    {
        $order->load(['table', 'items.menu', 'customer']);
        return inertia('Orders/Receipt', [
            'order' => $order,
            'taxes' => \App\Models\Tax::where('status', true)->get()
        ]);
    }

    public function receipt(\App\Models\Order $order)
    {
        $order->load(['table', 'items.menu', 'customer']);
        return inertia('Orders/Receipt', [
            'order' => $order,
            'taxes' => \App\Models\Tax::where('status', true)->get()
        ]);
    }

    public function edit(\App\Models\Order $order)
    {
        $order->load([
            'table', 
            'items', 
            'items.menu', 
            'items.addons'
        ]);

        return inertia('Orders/Edit', [
            'order' => $order,
            'menus' => \Inertia\Inertia::defer(fn() => \App\Models\Menu::where('status', true)->get()),
            'customers' => \Inertia\Inertia::defer(fn() => \App\Models\Customer::get()),
            'categories' => \Inertia\Inertia::defer(fn() => \App\Models\Category::where('status', true)->get()),
            'addons' => \Inertia\Inertia::defer(fn() => \App\Models\Addon::where('status', true)->get()),
            'taxes' => \Inertia\Inertia::defer(fn() => \App\Models\Tax::where('status', true)->get())
        ]);
    }

    public function create(Request $request)
    {
        $table = \App\Models\Table::findOrFail($request->table_id);
        return inertia('Orders/Edit', [
            'table' => $table,
            'menus' => \Inertia\Inertia::defer(fn() => \App\Models\Menu::where('status', true)->get()),
            'customers' => \Inertia\Inertia::defer(fn() => \App\Models\Customer::get()),
            'categories' => \Inertia\Inertia::defer(fn() => \App\Models\Category::where('status', true)->get()),
            'addons' => \Inertia\Inertia::defer(fn() => \App\Models\Addon::where('status', true)->get()),
            'taxes' => \Inertia\Inertia::defer(fn() => \App\Models\Tax::where('status', true)->get()),
            'order' => null,
            'reservation_id' => $request->reservation_id
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.addons' => 'sometimes|array',
            'status' => 'sometimes|in:pending,preparing,served,completed',
            'customer_id' => 'nullable|exists:customers,id',
            'discount_percentage' => 'sometimes|numeric|min:0|max:100',
            'discount_amount' => 'sometimes|numeric|min:0',
            'tip_amount' => 'sometimes|numeric|min:0',
            'cash_amount' => 'sometimes|numeric|min:0',
            'online_amount' => 'sometimes|numeric|min:0',
            'payment_method' => 'sometimes|string|nullable',
            'points_redeemed' => 'sometimes|numeric|min:0',
            'credit_amount' => 'sometimes|numeric|min:0',
            'due_payment_amount' => 'sometimes|numeric|min:0',
        ]);

        $table = \App\Models\Table::findOrFail($validated['table_id']);

        $order = Order::create([
            'table_id' => $table->id,
            'customer_id' => $validated['customer_id'] ?? null,
            'waiter_id' => auth()->id(),
            'status' => 'pending',
            'total_amount' => 0,
            'grand_total' => 0,
        ]);

        // Table status update is now handled by Order model's created hook

        $total = 0;
        foreach($validated['items'] as $item) {
            $menu = \App\Models\Menu::find($item['menu_id']);
            $itemPrice = $menu->price;
            $addonData = [];
            
            if (isset($item['addons']) && is_array($item['addons'])) {
                foreach($item['addons'] as $addonId) {
                    $addon = \App\Models\Addon::find($addonId);
                    if ($addon) {
                        $itemPrice += $addon->price;
                        $addonData[$addon->id] = [
                            'addon_name' => $addon->name,
                            'price' => $addon->price
                        ];
                    }
                }
            }

            $orderItem = $order->items()->create([
                'menu_id' => $menu->id,
                'quantity' => $item['quantity'],
                'price' => $itemPrice
            ]);
            
            if (!empty($addonData)) {
                $orderItem->addons()->sync($addonData);
            }
            
            $total += $itemPrice * $item['quantity'];
        }
        $order->total_amount = $total;
        $order->grand_total = $total;
        $order->save();

        if ($request->reservation_id) {
            \App\Models\Reservation::where('id', $request->reservation_id)
                ->where('table_id', $table->id)
                ->update(['status' => 'completed']);
        }

        ActivityLog::record('created', "New order started for Table {$table->table_number} (Price: \${$total})", $order);

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $this->processCompletion($order, $validated);
            $autoPrint = \App\Models\Setting::where('tenant_id', $order->tenant_id)->where('key', 'auto_print_receipt')->value('value');
            if (filter_var($autoPrint, FILTER_VALIDATE_BOOLEAN)) {
                return redirect()->route('orders.receipt', $order->id)->with('success', 'Order completed successfully.');
            }
            return redirect()->route('orders.index')->with('success', 'Order completed successfully.');
        }

        return redirect()->route('orders.edit', $order->id)->with('success', 'Order saved successfully. Payment option is now enabled.');
    }

    public function update(Request $request, \App\Models\Order $order)
    {
        $validated = $request->validate([
            'status'                  => 'sometimes|in:pending,preparing,served,completed',
            'items'                   => 'sometimes|array',
            'items.*.menu_id'         => 'required|exists:menus,id',
            'items.*.quantity'        => 'required|integer|min:1',
            'items.*.addons'          => 'sometimes|array',
            'items.*.order_item_id'   => 'sometimes|nullable',  // MongoDB ObjectId can be string
            'items.*.kds_status'      => 'sometimes|nullable|string',
            'items.*.price'           => 'sometimes|numeric',  // Added for frontend compatibility
            'discount_percentage'     => 'sometimes|numeric|min:0|max:100',
            'discount_amount'         => 'sometimes|numeric|min:0',
            'tip_amount'              => 'sometimes|numeric|min:0',
            'cash_amount'             => 'sometimes|numeric|min:0',
            'online_amount'           => 'sometimes|numeric|min:0',
            'payment_method'          => 'sometimes|string|nullable',
            'customer_id'             => 'nullable|exists:customers,id',
            'points_redeemed'         => 'sometimes|numeric|min:0',
            'credit_amount'           => 'sometimes|numeric|min:0',
            'due_payment_amount'      => 'sometimes|numeric|min:0',
        ]);

        if (isset($validated['customer_id'])) {
            $order->customer_id = $validated['customer_id'];
        }

        if (isset($validated['items'])) {
            // Collect the IDs of existing items the front-end is still showing
            $keptItemIds = collect($validated['items'])
                ->pluck('order_item_id')
                ->filter()
                ->values()
                ->all();

            // Delete only items that are NOT delivered AND are not being kept
            // (Delivered items are always preserved regardless)
            $order->items()
                ->where('kds_status', '!=', 'delivered')
                ->when(!empty($keptItemIds), fn($q) => $q->whereNotIn('id', $keptItemIds))
                ->delete();

            $total = 0;

            foreach ($validated['items'] as $item) {
                $existingItemId = $item['order_item_id'] ?? null;
                $existingStatus = $item['kds_status']    ?? null;

                // ── Already-delivered item: just count its price toward total ──
                if ($existingItemId && $existingStatus === 'delivered') {
                    $existing = OrderItem::find($existingItemId);
                    if ($existing) {
                        $total += $existing->price * $existing->quantity;
                    }
                    continue; // skip — do NOT touch the kitchen record
                }

                // ── Existing non-delivered item: update quantity / addons in place ──
                if ($existingItemId) {
                    $existing = OrderItem::find($existingItemId);
                    if ($existing) {
                        $menu      = \App\Models\Menu::find($item['menu_id']);
                        $itemPrice = $menu->price;
                        $addonData = [];

                        if (isset($item['addons']) && is_array($item['addons'])) {
                            foreach ($item['addons'] as $addonId) {
                                $addon = \App\Models\Addon::find($addonId);
                                if ($addon) {
                                    $itemPrice               += $addon->price;
                                    $addonData[$addon->id]    = [
                                        'addon_name' => $addon->name,
                                        'price'      => $addon->price,
                                    ];
                                }
                            }
                        }

                        $existing->update([
                            'quantity' => $item['quantity'],
                            'price'    => $itemPrice,
                        ]);

                        if (!empty($addonData)) {
                            $existing->addons()->sync($addonData);
                        }

                        $total += $itemPrice * $item['quantity'];
                        continue;
                    }
                }

                // ── Brand-new item: create with pending kds_status → goes to kitchen ──
                $menu      = \App\Models\Menu::find($item['menu_id']);
                $itemPrice = $menu->price;
                $addonData = [];

                if (isset($item['addons']) && is_array($item['addons'])) {
                    foreach ($item['addons'] as $addonId) {
                        $addon = \App\Models\Addon::find($addonId);
                        if ($addon) {
                            $itemPrice             += $addon->price;
                            $addonData[$addon->id]  = [
                                'addon_name' => $addon->name,
                                'price'      => $addon->price,
                            ];
                        }
                    }
                }

                $orderItem = $order->items()->create([
                    'menu_id'    => $menu->id,
                    'quantity'   => $item['quantity'],
                    'price'      => $itemPrice,
                    'kds_status' => 'pending',   // explicitly pending → will appear in KDS
                ]);

                if (!empty($addonData)) {
                    $orderItem->addons()->sync($addonData);
                }

                $total += $itemPrice * $item['quantity'];
            }

            $order->total_amount = $total;
            if ($order->status !== 'completed') {
                $order->grand_total = $total;
            }
        }

        if (isset($validated['status'])) {
            $order->status = $validated['status'];
            if ($validated['status'] === 'completed') {
                $this->processCompletion($order, $validated);
            }
        }
        $order->save();

        // If the order now has 0 items, cancel it completely to free the table
        if ($order->items()->count() === 0) {
            $order->update(['status' => 'cancelled']);
            
            return redirect()->route('table-book')->with('success', 'Order was empty and has been cancelled.');
        }

        ActivityLog::record('updated', "Order for Table {$order->table->table_number} status updated to {$order->status}", $order);

        if ($order->status === 'completed') {
            $autoPrint = \App\Models\Setting::where('tenant_id', $order->tenant_id)->where('key', 'auto_print_receipt')->value('value');
            if (filter_var($autoPrint, FILTER_VALIDATE_BOOLEAN)) {
                return redirect()->route('orders.receipt', $order->id)->with('success', 'Order completed successfully.');
            }
            return redirect()->route('orders.index')->with('success', 'Order completed successfully.');
        }

        return back()->with('success', 'Order updated successfully.');
    }

    protected function processCompletion(Order $order, array $data)
    {
        // Table status update is now handled by Order model's updated hook

        $order->status = 'completed';
        $order->discount_percentage = $data['discount_percentage'] ?? 0;
        $order->discount_amount = $data['discount_amount'] ?? 0;
        $order->tip_amount = $data['tip_amount'] ?? 0;
        $order->cash_amount = $data['cash_amount'] ?? 0;
        $order->online_amount = $data['online_amount'] ?? 0;
        $order->payment_method = $data['payment_method'] ?? null;
        $order->points_redeemed = $data['points_redeemed'] ?? 0;

        // Calculate Global Tax
        $activeTaxes = \App\Models\Tax::where('status', true)->get();
        $totalTaxRate = $activeTaxes->sum('rate');
        $taxableAmount = $order->total_amount - $order->discount_amount - $order->points_redeemed;
        $order->tax_amount = ($taxableAmount * $totalTaxRate) / 100;

        $order->grand_total = $taxableAmount + $order->tax_amount + $order->tip_amount;
        $order->save();

        // Handle credit and due payback mechanics
        $creditAmount = floatval($data['credit_amount'] ?? 0);
        $duePaymentAmount = floatval($data['due_payment_amount'] ?? 0);

        if ($order->customer_id && ($creditAmount > 0 || $duePaymentAmount > 0)) {
            $customer = $order->customer;

            if ($duePaymentAmount > 0) {
                // Ensure we don't over-deduct
                $payAmount = min($customer->due_amount, $duePaymentAmount);
                $customer->due_amount -= $payAmount;

                CreditTransaction::create([
                    'customer_id' => $customer->id,
                    'order_id'    => $order->id,
                    'type'        => 'payment',
                    'amount'      => $payAmount,
                    'note'        => "Paid back previous due along with Order #{$order->id} (Table {$order->table->table_number})",
                ]);

                ActivityLog::record(
                    'credit_payment',
                    "Paid {$payAmount} towards previous due. Remaining due: {$customer->due_amount}",
                    $customer
                );
            }

            if ($creditAmount > 0) {
                $customer->due_amount += $creditAmount;

                CreditTransaction::create([
                    'customer_id' => $customer->id,
                    'order_id'    => $order->id,
                    'type'        => 'charge',
                    'amount'      => $creditAmount,
                    'note'        => "Charged from Order #{$order->id} (Table {$order->table->table_number})",
                ]);

                ActivityLog::record(
                    'credit_charge',
                    "Credit charge of {$creditAmount} added for {$customer->name} from Order #{$order->id}. Total due: {$customer->due_amount}",
                    $customer
                );
            }

            $customer->save();
        }

        // Award loyalty points
        if ($order->customer_id) {
            $customer = $order->customer()->first(); // Re-fetch after possible credit update

            if ($order->points_redeemed > 0) {
                $customer->loyalty_points -= $order->points_redeemed;
            }

            $pointsPerCurrency = \App\Models\Setting::where('key', 'points_per_currency')->first()?->value ?? 0.01;
            $pointsToAward = floor($order->grand_total * $pointsPerCurrency);
            
            $order->update(['points_earned' => $pointsToAward]);

            $customer->loyalty_points += $pointsToAward;
            $customer->lifetime_points += $pointsToAward;
            $customer->total_spent += $order->grand_total;
            $customer->save();

            ActivityLog::record('earned', "Earned {$pointsToAward} pts from Order #{$order->id}", $customer, ['order_id' => $order->id, 'points' => $pointsToAward]);
        }

        ActivityLog::record('completed', "Order for Table {$order->table->table_number} completed. Total: {$order->grand_total}", $order);
    }

    public function destroy(\App\Models\Order $order)
    {
        $tableNum = $order->table->table_number;

        // Revert loyalty points for any redemptions in the order
        if ($order->customer_id) {
            $customer = $order->customer;
            $pointsToRevert = $order->items()->where('is_redeemed', true)->sum('points_cost');

            if ($pointsToRevert > 0) {
                $customer->loyalty_points += $pointsToRevert;
                $customer->save();
                ActivityLog::record('refunded', "Loyalty points restored: {$pointsToRevert} pts (Order for Table {$tableNum} cancelled)", $customer);
            }
        }

        // Automatic table status update is now handled by Order model's deleting hook
        $order->update(['status' => 'cancelled']);
        ActivityLog::record('deleted', "Order for Table {$tableNum} was cancelled");
        return redirect()->route('dashboard')->with('success', 'Order cancelled successfully.');
    }

}
