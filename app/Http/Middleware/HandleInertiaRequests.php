<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'is_impersonating' => session()->has('original_user_id'),
            'trial' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id) {
                    $tenant = \App\Models\Tenant::find($user->tenant_id);
                    if ($tenant && $tenant->trial_ends_at) {
                        $now = \Carbon\Carbon::now();
                        $endsAt = \Carbon\Carbon::parse($tenant->trial_ends_at);
                        $isExpired = $now->greaterThan($endsAt);
                        
                        return [
                            'ends_at' => $endsAt->toIso8601String(),
                            'days_remaining' => $isExpired ? 0 : (int) ceil($now->floatDiffInDays($endsAt)),
                            'is_expired' => $isExpired,
                        ];
                    }
                }
                return null;
            },
            'settings' => function () use ($request) {
                $tenantId = null;
                $user = $request->user();
                
                if ($user && $user->tenant_id) {
                    $tenantId = $user->tenant_id;
                } else {
                    // Try to get tenant from slug in route (for guests)
                    $slug = $request->route('tenant_slug');
                    if ($slug) {
                        $tenantId = cache()->remember('tenant_id_' . $slug, 3600, function() use ($slug) {
                            return \App\Models\Tenant::where('slug', $slug)->value('id');
                        });
                    }
                }

                if (!$tenantId) {
                    return null;
                }

                $cacheKey = 'settings_tenant_' . $tenantId;
                return cache()->remember($cacheKey, 60, function() use ($tenantId) {
                    $settings = \App\Models\Setting::where('tenant_id', $tenantId)->pluck('value', 'key');
                    // Ensure image paths are absolute URLs using the configured disk URL
                    if (isset($settings['site_logo']) && $settings['site_logo']) {
                        $settings['site_logo'] = \Illuminate\Support\Facades\Storage::disk('public')->url($settings['site_logo']);
                    }
                    if (isset($settings['site_favicon']) && $settings['site_favicon']) {
                        $settings['site_favicon'] = \Illuminate\Support\Facades\Storage::disk('public')->url($settings['site_favicon']);
                    }
                    return $settings;
                });
            },
            'tenant_slug' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id) {
                    return cache()->remember('tenant_slug_' . $user->tenant_id, 3600, function() use ($user) {
                        $tenant = \App\Models\Tenant::find($user->tenant_id);
                        return $tenant?->slug;
                    });
                }
                // Fallback to route parameter or session if available
                return $request->route('tenant_slug') ?? session('tenant_slug');
            },
            'active_orders_count' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id && $user->role !== 'super_admin') {
                    return \App\Models\Order::where('tenant_id', $user->tenant_id)
                        ->whereNotIn('status', ['completed', 'cancelled'])
                        ->count();
                }
                return 0;
            },
            'cancelled_orders_count' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id && $user->role !== 'super_admin') {
                    return \App\Models\Order::where('tenant_id', $user->tenant_id)
                        ->where('status', 'cancelled')
                        ->count();
                }
                return 0;
            },
            'completed_today_count' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id && $user->role !== 'super_admin') {
                    return \App\Models\Order::where('tenant_id', $user->tenant_id)
                        ->where('status', 'completed')
                        ->whereDate('created_at', \Carbon\Carbon::today())
                        ->count();
                }
                return 0;
            },
            'kds_items_count' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id && $user->role !== 'super_admin') {
                    return \App\Models\OrderItem::whereIn('kds_status', ['pending', 'preparing'])
                        ->whereHas('order', function ($q) use ($user) {
                            $q->where('tenant_id', $user->tenant_id)
                              ->whereNotIn('status', ['completed', 'cancelled']);
                        })->count();
                }
                return 0;
            },
            'service_ready_count' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->tenant_id && $user->role !== 'super_admin') {
                    return \App\Models\OrderItem::where('kds_status', 'ready')
                        ->whereHas('order', function ($q) use ($user) {
                            $q->where('tenant_id', $user->tenant_id)
                              ->whereNotIn('status', ['completed', 'cancelled']);
                        })->count();
                }
                return 0;
            },
        ];
    }
}
