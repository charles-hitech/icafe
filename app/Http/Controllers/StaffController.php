<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'staff'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        ActivityLog::record('created', "Added new staff member: {$user->name} ({$user->role})", $user);

        return back()->with('success', 'Staff member added successfully.');
    }

    public function update(Request $request, User $staff)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($staff->id)],
            'role' => ['required', Rule::in(['admin', 'staff'])],
            'password' => 'nullable|string|min:8',
        ]);

        $staff->name = $validated['name'];
        $staff->email = $validated['email'];
        $staff->role = $validated['role'];

        if ($request->filled('password')) {
            $staff->password = Hash::make($validated['password']);
        }

        $staff->save();

        ActivityLog::record('updated', "Updated staff member details: {$staff->name}", $staff);

        return back()->with('success', 'Staff member updated successfully.');
    }

    public function destroy(User $staff)
    {
        // Prevent deleting yourself if you are the current user
        if (auth()->id() === $staff->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $name = $staff->name;
        $staff->delete();

        ActivityLog::record('deleted', "Removed staff member: {$name}");

        return back()->with('success', 'Staff member removed successfully.');
    }
}
