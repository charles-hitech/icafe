<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('discount_percentage', 5, 2)->default(0)->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_percentage');
            $table->decimal('tip_amount', 10, 2)->default(0)->after('discount_amount');
            $table->decimal('grand_total', 10, 2)->default(0)->after('tip_amount');
            $table->decimal('cash_amount', 10, 2)->default(0)->after('grand_total');
            $table->decimal('online_amount', 10, 2)->default(0)->after('cash_amount');
            $table->string('payment_method')->nullable()->after('online_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'discount_percentage',
                'discount_amount',
                'tip_amount',
                'grand_total',
                'cash_amount',
                'online_amount',
                'payment_method'
            ]);
        });
    }
};
