<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class MediaController extends Controller
{
    /**
     * Get all images from the menus directory.
     */
    public function index(Request $request)
    {
        $type = $request->input('type', 'images'); // 'images' or 'icons'
        $tenantId = auth()->user()->tenant_id;
        $directory = "tenants/{$tenantId}/menus/{$type}";
        
        if (!Storage::disk('public')->exists($directory)) {
            return response()->json([]);
        }

        $files = Storage::disk('public')->files($directory);
        
        $media = collect($files)->map(function ($file) {
            return [
                'name' => basename($file),
                'path' => $file,
                'url' => Storage::disk('public')->url($file),
                'size' => Storage::disk('public')->size($file),
                'last_modified' => Storage::disk('public')->lastModified($file),
            ];
        })->sortByDesc('last_modified')->values();

        return response()->json($media);
    }
}
