<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\Table;
use App\Models\Menu;
use App\Models\Reservation;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->check() && auth()->user()->role === 'super_admin') {
            return redirect()->route('superadmin.dashboard');
        }

        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : Carbon::today()->subDays(6)->startOfDay();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : Carbon::today()->endOfDay();

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Metrics
        $totalItems = Menu::where('status', true)->count();
        $totalTables = Table::count();
        $activeTables = Table::where('status', 'occupied')->count();
        
        $todaySales = Order::where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->sum('grand_total');

        $yesterdaySales = Order::where('status', 'completed')
            ->whereDate('updated_at', $yesterday)
            ->sum('grand_total');

        $monthlySales = Order::where('status', 'completed')
            ->where('updated_at', '>=', $startOfMonth)
            ->sum('grand_total');

        $totalSales = Order::where('status', 'completed')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->sum('grand_total');

        // Weekly Sales Trend (Based on Filtered Period)
        // MongoDB-compatible: Get all orders and group in PHP
        $orders = Order::where('status', 'completed')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->get(['updated_at', 'grand_total']);

        // Group by date in PHP
        $rawWeeklySales = $orders->groupBy(function($order) {
            return Carbon::parse($order->updated_at)->toDateString();
        })->map(function($dayOrders) {
            return (object)[
                'total' => $dayOrders->sum('grand_total')
            ];
        });

        $weeklySales = [];
        $diffInDays = $startDate->diffInDays($endDate);
        
        // Loop from the oldest date to the newest (startDate to endDate)
        for ($i = 0; $i <= $diffInDays; $i++) {
            $dateString = (clone $startDate)->addDays($i)->toDateString();
            $dateObj = (clone $startDate)->addDays($i);
            
            $weeklySales[] = [
                'day' => $dateObj->format('D'),
                'total' => (float)($rawWeeklySales[$dateString]->total ?? 0),
                'date' => $dateObj->format('M d'),
            ];
        }

        // Recent Activity (Audit Timeline)
        $recentActivity = ActivityLog::with('user')
            ->latest()
            ->take(15)
            ->get();

        $todayCash = Order::where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->sum('cash_amount');

        $todayOnline = Order::where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->sum('online_amount');

        // Avg Turnaround Time Today (created_at → updated_at, in minutes)
        // MongoDB-compatible: Calculate in PHP
        $completedOrders = Order::where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->get(['created_at', 'updated_at']);

        $avgTurnaround = 0;
        if ($completedOrders->count() > 0) {
            $totalMinutes = $completedOrders->sum(function($order) {
                $created = Carbon::parse($order->created_at);
                $updated = Carbon::parse($order->updated_at);
                return $created->diffInMinutes($updated);
            });
            $avgTurnaround = $totalMinutes / $completedOrders->count();
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_items' => $totalItems,
                'total_tables' => $totalTables,
                'active_tables' => $activeTables,
                'today_sales' => (float)$todaySales,
                'today_cash' => (float)$todayCash,
                'today_online' => (float)$todayOnline,
                'yesterday_sales' => (float)$yesterdaySales,
                'monthly_sales' => (float)$monthlySales,
                'total_sales' => (float)$totalSales,
                'avg_turnaround_mins' => (float)round($avgTurnaround),
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'recent_activity' => Inertia::defer(fn() => $recentActivity),
            'weekly_sales' => Inertia::defer(fn() => $weeklySales),
        ]);
    }
}
