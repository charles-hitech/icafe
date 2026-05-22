<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index()
    {
        $tables = \App\Models\Table::with([
            'orders' => function($q) {
                $q->where('status', '!=', 'completed')->with('customer');
            },
            'reservations' => function($q) {
                $q->where('status', 'active');
            }
        ])->get();

        // Auto-cleanup: If an occupied table has no actual order items, free it
        foreach ($tables as $table) {
            if ($table->status === 'occupied') {
                $activeOrder = $table->orders->first();
                if (!$activeOrder || $activeOrder->items()->count() === 0) {
                    if ($activeOrder) $activeOrder->delete();
                    $table->update(['status' => 'available']);
                }
            }
        }

        return \Inertia\Inertia::render('TableBook', [
            'tables' => $tables,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => [
                'required',
                'string',
                \Illuminate\Validation\Rule::unique('tables')->where(function ($query) {
                    return $query->where('tenant_id', auth()->user()->tenant_id);
                })
            ],
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,reserved,occupied'
        ]);

        \App\Models\Table::create($validated);
        return back()->with('success', 'Table created successfully.');
    }

    public function update(Request $request, \App\Models\Table $table)
    {
        $validated = $request->validate([
            'table_number' => [
                'required',
                'string',
                \Illuminate\Validation\Rule::unique('tables')->ignore($table->id)->where(function ($query) {
                    return $query->where('tenant_id', auth()->user()->tenant_id);
                })
            ],
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,reserved,occupied'
        ]);

        $table->update($validated);
        return back()->with('success', 'Table updated successfully.');
    }

    public function destroy(\App\Models\Table $table)
    {
        $table->delete();
        return back()->with('success', 'Table deleted successfully.');
    }
}
