<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // Notice we disable global scopes to get ALL users, because the super_admin might want to see everyone.
        // Wait, the BelongsToTenant scope only applies if the user has a tenant_id. Since SuperAdmin might have null, it might see all anyway.
        // To be safe, we use withoutGlobalScope.
        $users = \App\Models\User::withoutGlobalScope(\App\Models\Scopes\TenantScope::class)
            ->with('tenant')
            ->latest()
            ->get();
            
        return \Inertia\Inertia::render('Superadmin/Users/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        $tenants = \App\Models\Tenant::all();
        return \Inertia\Inertia::render('Superadmin/Users/CreateEdit', [
            'tenants' => $tenants
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', \Illuminate\Validation\Rules\Password::defaults()],
            'role' => 'required|in:super_admin,admin,staff,kitchen',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);

        \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => $request->role,
            'tenant_id' => $request->tenant_id,
        ]);

        return redirect()->route('superadmin.users.index')->with('success', 'User created successfully.');
    }

    public function edit($id)
    {
        $user = \App\Models\User::withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->findOrFail($id);
        $tenants = \App\Models\Tenant::all();
        return \Inertia\Inertia::render('Superadmin/Users/CreateEdit', [
            'user' => $user,
            'tenants' => $tenants
        ]);
    }

    public function update(\Illuminate\Http\Request $request, $id)
    {
        $user = \App\Models\User::withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => ['nullable', \Illuminate\Validation\Rules\Password::defaults()],
            'role' => 'required|in:super_admin,admin,staff,kitchen',
            'tenant_id' => 'nullable|exists:tenants,id',
        ]);

        $data = $request->only(['name', 'email', 'phone', 'role', 'tenant_id']);
        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('superadmin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = \App\Models\User::withoutGlobalScope(\App\Models\Scopes\TenantScope::class)->findOrFail($id);
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }
        $user->delete();
        return redirect()->route('superadmin.users.index')->with('success', 'User deleted successfully.');
    }
}
