<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic Plan',
                'description' => 'Perfect for small cafes just getting started.',
                'price_monthly' => 29.00,
                'price_3_months' => 80.00,
                'price_6_months' => 150.00,
                'price_yearly' => 290.00,
                'trial_days' => 14,
                'features' => json_encode(['Menu Management', 'Basic POS', 'Daily Reports', 'Up to 5 Users']),
                'is_active' => true,
            ],
            [
                'name' => 'Pro Plan',
                'description' => 'For growing cafes that need more advanced features.',
                'price_monthly' => 59.00,
                'price_3_months' => 165.00,
                'price_6_months' => 315.00,
                'price_yearly' => 590.00,
                'trial_days' => 14,
                'features' => json_encode(['Menu Management', 'Advanced POS', 'KDS', 'Inventory Management', 'Advanced Analytics', 'Unlimited Users']),
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\Plan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
