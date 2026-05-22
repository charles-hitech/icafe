<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use MongoDB\Laravel\Eloquent\Model;

class Menu extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'category', 'category_id', 'price', 'original_price', 'cost_price', 'status', 'image_path', 'icon_path'];

    public function category_group()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * Get the full URL for the image with cache busting.
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image_path) return null;
        $ts = $this->updated_at ? $this->updated_at->timestamp : time();
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->image_path) . '?v=' . $ts;
    }

    /**
     * Get the full URL for the icon with cache busting.
     */
    public function getIconUrlAttribute()
    {
        if (!$this->icon_path) return null;
        $ts = $this->updated_at ? $this->updated_at->timestamp : time();
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->icon_path) . '?v=' . $ts;
    }

    protected $appends = ['image_url', 'icon_url'];
}
