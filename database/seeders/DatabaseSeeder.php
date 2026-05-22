<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create tenants first
        $this->call(TenantSeeder::class);

        // Get the default tenant (ID = 1)
        $tenant = \App\Models\Tenant::find(1);

        // Create admin user with tenant
        User::updateOrCreate(['email' => 'admin@cafe.com'], [
            'name' => 'Admin User',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'tenant_id' => 1,
        ]);

        // Create staff user with tenant
        User::updateOrCreate(['email' => 'staff@cafe.com'], [
            'name' => 'Staff User',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'tenant_id' => 1,
        ]);

        $tables = [
            ['table_number' => 'T1', 'capacity' => 2, 'status' => 'available', 'tenant_id' => 1],
            ['table_number' => 'T2', 'capacity' => 2, 'status' => 'available', 'tenant_id' => 1],
            ['table_number' => 'T3', 'capacity' => 4, 'status' => 'available', 'tenant_id' => 1],
            ['table_number' => 'T4', 'capacity' => 4, 'status' => 'available', 'tenant_id' => 1],
            ['table_number' => 'T5', 'capacity' => 6, 'status' => 'available', 'tenant_id' => 1],
        ];

        foreach ($tables as $table) {
            \App\Models\Table::updateOrCreate(['table_number' => $table['table_number']], $table);
        }

        $menus = [
            ['name' => 'Espresso', 'category' => 'Coffee', 'price' => 3.50, 'status' => true, 'tenant_id' => 1],
            ['name' => 'Cappuccino', 'category' => 'Coffee', 'price' => 4.50, 'status' => true, 'tenant_id' => 1],
            ['name' => 'Latte', 'category' => 'Coffee', 'price' => 5.00, 'status' => true, 'tenant_id' => 1],
            ['name' => 'Croissant', 'category' => 'Snacks', 'price' => 3.00, 'status' => true, 'tenant_id' => 1],
            ['name' => 'Cheesecake', 'category' => 'Snacks', 'price' => 6.00, 'status' => true, 'tenant_id' => 1],
            ['name' => 'Lemonade', 'category' => 'Drinks', 'price' => 4.00, 'status' => true, 'tenant_id' => 1],
        ];

        foreach ($menus as $menu) {
            \App\Models\Menu::updateOrCreate(['name' => $menu['name']], $menu);
        }

        $this->call(SettingSeeder::class);
    }
}
