<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('FrontEnd/Home');
})->name('home');

Route::get('/book-demo', function () {
    return Inertia::render('FrontEnd/BookDemo');
})->name('book-demo');

Route::get('/start-trial', function () {
    return Inertia::render('FrontEnd/StartTrial');
})->name('start-trial');

Route::get('/test-cache', function () {
    $tenant_id = auth()->id() ? auth()->user()->tenant_id : 1;
    return cache()->get('settings_tenant_' . $tenant_id);
});

Route::middleware('auth')->group(function () {
    // Dashboard — accessible to all authenticated users (role handled inside controller)
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/stop-impersonating', [\App\Http\Controllers\Superadmin\TenantController::class, 'stopImpersonating'])->name('impersonate.stop');

    // Super Admin Routes
    Route::middleware('role:super_admin')->prefix('superadmin')->name('superadmin.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Superadmin\DashboardController::class, 'index'])->name('dashboard');
        
        Route::resource('tenants', \App\Http\Controllers\Superadmin\TenantController::class)->except(['show']);
        Route::patch('tenants/{tenant}/toggle', [\App\Http\Controllers\Superadmin\TenantController::class, 'toggleStatus'])->name('tenants.toggle');
        Route::post('tenants/{tenant}/impersonate', [\App\Http\Controllers\Superadmin\TenantController::class, 'impersonate'])->name('tenants.impersonate');
        
        Route::resource('users', \App\Http\Controllers\Superadmin\UserController::class)->except(['show']);
        
        Route::resource('plans', \App\Http\Controllers\Superadmin\PlanController::class)->except(['show']);
        
        Route::get('support', [\App\Http\Controllers\Superadmin\SupportTicketController::class, 'index'])->name('support.index');
        Route::get('support/{ticket}', [\App\Http\Controllers\Superadmin\SupportTicketController::class, 'show'])->name('support.show');
        Route::post('support/{ticket}/reply', [\App\Http\Controllers\Superadmin\SupportTicketController::class, 'reply'])->name('support.reply');
        Route::patch('support/{ticket}/status', [\App\Http\Controllers\Superadmin\SupportTicketController::class, 'updateStatus'])->name('support.status');
    });

    // Admin Only Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('reports/export', [\App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');
        Route::get('reports/analytics', [\App\Http\Controllers\ReportController::class, 'analytics'])->name('reports.analytics');
        Route::resource('reports', \App\Http\Controllers\ReportController::class)->only(['index']);
        
        Route::resource('menus', \App\Http\Controllers\MenuController::class)->except(['create', 'edit']);
        Route::resource('categories', \App\Http\Controllers\CategoryController::class)->except(['create', 'edit']);
        Route::resource('addons', \App\Http\Controllers\AddonController::class)->except(['create', 'edit']);
        Route::resource('taxes', \App\Http\Controllers\TaxController::class)->except(['create', 'edit']);
        
        Route::get('staff/performance', [\App\Http\Controllers\ShiftController::class, 'performance'])->name('staff.performance');
        Route::resource('staff', \App\Http\Controllers\StaffController::class)->only(['store', 'update', 'destroy']);
        
        Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
        
        Route::get('/my-plan', function () {
            return Inertia::render('Admin/MyPlan');
        })->name('tenant.plan');
        
        Route::get('support', [\App\Http\Controllers\SupportTicketController::class, 'index'])->name('support.index');
        Route::post('support', [\App\Http\Controllers\SupportTicketController::class, 'store'])->name('support.store');
        Route::get('support/{ticket}', [\App\Http\Controllers\SupportTicketController::class, 'show'])->name('support.show');
        Route::post('support/{ticket}/reply', [\App\Http\Controllers\SupportTicketController::class, 'reply'])->name('support.reply');
        Route::patch('support/{ticket}/status', [\App\Http\Controllers\SupportTicketController::class, 'updateStatus'])->name('support.status');
        
        Route::resource('loyalty-rewards', \App\Http\Controllers\LoyaltyRewardController::class)->except(['create', 'edit']);
        
        Route::get('/inventory', [\App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.index');
        // Items
        Route::post('/inventory/items', [\App\Http\Controllers\InventoryController::class, 'storeItem'])->name('inventory.items.store');
        Route::put('/inventory/items/{item}', [\App\Http\Controllers\InventoryController::class, 'updateItem'])->name('inventory.items.update');
        Route::delete('/inventory/items/{item}', [\App\Http\Controllers\InventoryController::class, 'destroyItem'])->name('inventory.items.destroy');
        // Purchases
        Route::post('/inventory/purchases', [\App\Http\Controllers\InventoryController::class, 'storePurchase'])->name('inventory.purchases.store');
        Route::put('/inventory/purchases/{purchase}', [\App\Http\Controllers\InventoryController::class, 'updatePurchase'])->name('inventory.purchases.update');
        Route::delete('/inventory/purchases/{purchase}', [\App\Http\Controllers\InventoryController::class, 'destroyPurchase'])->name('inventory.purchases.destroy');
        // Usages
        Route::post('/inventory/usages', [\App\Http\Controllers\InventoryController::class, 'storeUsage'])->name('inventory.usages.store');
        Route::put('/inventory/usages/{usage}', [\App\Http\Controllers\InventoryController::class, 'updateUsage'])->name('inventory.usages.update');
        Route::delete('/inventory/usages/{usage}', [\App\Http\Controllers\InventoryController::class, 'destroyUsage'])->name('inventory.usages.destroy');
        // Configuration
        Route::post('/inventory/suppliers', [\App\Http\Controllers\InventoryController::class, 'storeSupplier'])->name('inventory.suppliers.store');
        Route::put('/inventory/suppliers/{supplier}', [\App\Http\Controllers\InventoryController::class, 'updateSupplier'])->name('inventory.suppliers.update');
        Route::delete('/inventory/suppliers/{supplier}', [\App\Http\Controllers\InventoryController::class, 'destroySupplier'])->name('inventory.suppliers.destroy');
        
        Route::post('/inventory/units', [\App\Http\Controllers\InventoryController::class, 'storeUnit'])->name('inventory.units.store');
        Route::put('/inventory/units/{unit}', [\App\Http\Controllers\InventoryController::class, 'updateUnit'])->name('inventory.units.update');
        Route::delete('/inventory/units/{unit}', [\App\Http\Controllers\InventoryController::class, 'destroyUnit'])->name('inventory.units.destroy');
        
        Route::post('/inventory/groups', [\App\Http\Controllers\InventoryController::class, 'storeGroup'])->name('inventory.groups.store');
        Route::put('/inventory/groups/{group}', [\App\Http\Controllers\InventoryController::class, 'updateGroup'])->name('inventory.groups.update');
        Route::delete('/inventory/groups/{group}', [\App\Http\Controllers\InventoryController::class, 'destroyGroup'])->name('inventory.groups.destroy');
    });

    // Staff & Admin Routes
    Route::middleware('role:admin,staff')->group(function () {
        Route::get('/table-book', [\App\Http\Controllers\TableController::class, 'index'])->name('table-book');
        Route::resource('tables', \App\Http\Controllers\TableController::class)->except(['index', 'create', 'edit']);
        Route::resource('reservations', \App\Http\Controllers\ReservationController::class)->except(['create', 'edit']);
        Route::get('service-view', [\App\Http\Controllers\OrderController::class, 'serviceView'])->name('orders.service');
        Route::resource('customers', \App\Http\Controllers\CustomerController::class);
        Route::post('customers/{customer}/credit-payment', [\App\Http\Controllers\CreditController::class, 'recordPayment'])->name('customers.credit-payment');
        Route::post('shifts/clock-in', [\App\Http\Controllers\ShiftController::class, 'clockIn'])->name('shifts.clock-in');
        Route::post('shifts/clock-out', [\App\Http\Controllers\ShiftController::class, 'clockOut'])->name('shifts.clock-out');
        Route::resource('orders', \App\Http\Controllers\OrderController::class);
        Route::get('orders/{order}/receipt', [\App\Http\Controllers\OrderController::class, 'receipt'])->name('orders.receipt');
    });

    // Universal Authenticated Routes (Admin, Staff, Kitchen)
    Route::get('kds', [\App\Http\Controllers\OrderController::class, 'kds'])->name('orders.kds');
    Route::post('order-items/{item}/status', [\App\Http\Controllers\OrderController::class, 'updateItemStatus'])->name('order-items.update-status');
    Route::get('/api/media', [\App\Http\Controllers\MediaController::class, 'index'])->name('api.media');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Guest & Public Routes - Moved to bottom to prevent route conflicts
Route::get('{tenant_slug}/qro/{tableNumber}', [\App\Http\Controllers\GuestOrderController::class, 'showMenu'])->name('guest.menu');
Route::post('{tenant_slug}/qro/order/{tableId}', [\App\Http\Controllers\GuestOrderController::class, 'placeOrder'])->name('guest.order');
Route::post('{tenant_slug}/qro/cancel/{item}', [\App\Http\Controllers\GuestOrderController::class, 'cancelItem'])->name('guest.cancel-item');
Route::post('{tenant_slug}/qro/loyalty-check', [\App\Http\Controllers\GuestOrderController::class, 'checkLoyalty'])->name('guest.loyalty-check');
Route::get('{tenant_slug}/book-table', [\App\Http\Controllers\GuestOrderController::class, 'showPublicReservation'])->name('public.reserve');
Route::post('{tenant_slug}/book-table', [\App\Http\Controllers\ReservationController::class, 'store'])->name('public.reserve.store');
