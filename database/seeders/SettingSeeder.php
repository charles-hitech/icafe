<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the default tenant (ID = 1)
        $tenant = \App\Models\Tenant::find(1);
        
        if (!$tenant) {
            // If tenant doesn't exist, create it
            $tenant = \App\Models\Tenant::updateOrCreate(
                ['id' => 1],
                [
                    'name' => 'Default Cafe',
                    'slug' => 'default-cafe',
                    'is_active' => true,
                ]
            );
        }

        $settings = [
            ['key' => 'site_name', 'value' => 'AI Cafe POS', 'type' => 'text', 'tenant_id' => 1],
            ['key' => 'site_description', 'value' => 'Premium Table Booking & Order Management System', 'type' => 'text', 'tenant_id' => 1],
            ['key' => 'site_logo', 'value' => null, 'type' => 'file', 'tenant_id' => 1],
            ['key' => 'site_favicon', 'value' => null, 'type' => 'file', 'tenant_id' => 1],
            ['key' => 'currency_symbol', 'value' => 'रू.', 'type' => 'text', 'tenant_id' => 1],
            ['key' => 'contact_phone', 'value' => '+977-1234567890', 'type' => 'text', 'tenant_id' => 1],
            ['key' => 'contact_email', 'value' => 'hello@aicafepos.com', 'type' => 'text', 'tenant_id' => 1],
            ['key' => 'points_per_currency', 'value' => '0.01', 'type' => 'number', 'tenant_id' => 1], // Points earned per currency unit (e.g., 0.01 = 1 point per 100 rupees)
            ['key' => 'points_to_currency_rate', 'value' => '1', 'type' => 'number', 'tenant_id' => 1], // 1 point = X currency units
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
