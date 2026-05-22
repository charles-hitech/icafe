<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (Auth::hasUser()) {
            $user = Auth::user();
            
            // Super admins can see everything across all tenants
            if ($user->role === 'super_admin') {
                return;
            }

            if ($user->tenant_id) {
                // MongoDB-compatible: use field name directly without table prefix
                $builder->where('tenant_id', $user->tenant_id);
            }
        }
    }
}
