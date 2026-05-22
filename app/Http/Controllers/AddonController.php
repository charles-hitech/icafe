<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Addon;

class AddonController extends Controller
{
    public function index()
    {
        return Inertia::render('Addons/Index', [
            'addons' => Addon::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                \Illuminate\Validation\Rule::unique('addons')->where(function ($query) {
                    return $query->where('tenant_id', auth()->user()->tenant_id);
                })
            ],
            'price' => 'required|numeric|min:0',
            'status' => 'boolean'
        ]);

        Addon::create($validated);
        return back()->with('success', 'Add-on created successfully.');
    }

    public function update(Request $request, Addon $addon)
    {
        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                \Illuminate\Validation\Rule::unique('addons')->ignore($addon->id)->where(function ($query) {
                    return $query->where('tenant_id', auth()->user()->tenant_id);
                })
            ],
            'price' => 'required|numeric|min:0',
            'status' => 'boolean'
        ]);

        $addon->update($validated);
        return back()->with('success', 'Add-on updated successfully.');
    }

    public function destroy(Addon $addon)
    {
        $addon->delete();
        return back()->with('success', 'Add-on deleted successfully.');
    }
}
