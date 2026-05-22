<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LoyaltyReward;
use App\Models\Menu;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Storage;

class LoyaltyRewardController extends Controller
{
    public function index()
    {
        return inertia('Loyalty/Rewards', [
            'rewards' => LoyaltyReward::with('menuItem')->latest()->get(),
            'menus' => Menu::where('status', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'points_required' => 'required|integer|min:1',
            'menu_item_id' => 'required|exists:menus,id',
            'status' => 'boolean',
            'image' => 'nullable'
        ]);

        $data = $request->except('image');
        
        if ($request->hasFile('image')) {
            $tenantId = auth()->user()->tenant_id;
            $data['image_path'] = $request->file('image')->store("tenants/{$tenantId}/rewards", 'public');
        } elseif (is_string($request->image)) {
            // Support for gallery selection (existing path)
            $data['image_path'] = $request->image;
        }

        $reward = LoyaltyReward::create($data);

        ActivityLog::record('created', "New loyalty reward created: {$reward->name} ({$reward->points_required} pts)", $reward);

        return back()->with('success', 'Loyalty reward created.');
    }

    public function update(Request $request, LoyaltyReward $loyalty_reward)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'points_required' => 'required|integer|min:1',
            'menu_item_id' => 'required|exists:menus,id',
            'status' => 'boolean',
            'image' => 'nullable'
        ]);

        $data = $request->except(['image', 'status']);
        $data['status'] = $request->boolean('status');

        if ($request->hasFile('image')) {
            if ($loyalty_reward->image_path) {
                Storage::disk('public')->delete($loyalty_reward->image_path);
            }
            $tenantId = auth()->user()->tenant_id;
            $data['image_path'] = $request->file('image')->store("tenants/{$tenantId}/rewards", 'public');
        } elseif (is_string($request->image)) {
            // Support for gallery selection (existing path)
            $data['image_path'] = $request->image;
        }

        $loyalty_reward->update($data);

        ActivityLog::record('updated', "Loyalty reward updated: {$loyalty_reward->name}", $loyalty_reward);

        return back()->with('success', 'Loyalty reward updated.');
    }

    public function destroy($id)
    {
        $reward = LoyaltyReward::findOrFail($id);
        $name = $reward->name;
        
        // Record activity without the subject object to avoid issues on delete
        ActivityLog::record('deleted', "Loyalty reward removed: {$name}");

        if ($reward->image_path) {
            Storage::disk('public')->delete($reward->image_path);
        }
        
        $reward->delete();

        return back()->with('success', 'Loyalty reward deleted.');
    }
}
