<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class LoyaltyReward extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'name',
        'description',
        'points_required',
        'menu_item_id',
        'status',
        'image_path'
    ];

    protected $casts = [
        'status' => 'boolean',
        'points_required' => 'integer',
    ];

    public function menuItem()
    {
        return $this->belongsTo(Menu::class, 'menu_item_id');
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) return null;
        $ts = $this->updated_at ? $this->updated_at->timestamp : time();
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->image_path) . '?v=' . $ts;
    }

    protected $appends = ['image_url'];
}
