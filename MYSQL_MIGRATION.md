# MySQL Migration Guide

This project has been converted from **MongoDB to MySQL**. All Docker configurations have been removed.

## ✅ What Has Been Changed

### 1. **Models Converted** (26 models)
All models have been converted from MongoDB to standard Laravel Eloquent:

- ✅ User.php - Changed from `MongoDB\Laravel\Auth\User` to `Illuminate\Foundation\Auth\User`
- ✅ All other models - Changed from `MongoDB\Laravel\Eloquent\Model` to `Illuminate\Database\Eloquent\Model`

**Models Updated:**
- Order, OrderItem
- Customer, Category
- Menu, Addon
- Table, Reservation
- Setting, Shift, Tax
- InventoryItem, InventoryPurchase, InventoryUsage
- CreditTransaction, LoyaltyReward
- MeasuringUnit, Supplier, StockGroup
- ActivityLog
- Plan, Subscription, Tenant
- Ticket, TicketMessage

### 2. **Composer Dependencies**
- ✅ Removed `mongodb/laravel-mongodb` package

### 3. **Environment Configuration**
- ✅ Updated `.env.example` to use MySQL instead of MongoDB

## 📋 Setup Steps for MySQL

### 1. Install Dependencies

```bash
# Remove MongoDB package and reinstall
composer remove mongodb/laravel-mongodb
composer install
```

### 2. Configure Database

Create `.env` file (if not exists):

```bash
cp .env.example .env
```

Update database settings in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=icafe
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Create Database

**Using MySQL CLI:**
```sql
mysql -u root -p
CREATE DATABASE icafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

**Or using phpMyAdmin:**
- Open phpMyAdmin
- Create new database named `icafe`
- Set collation to `utf8mb4_unicode_ci`

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed Database (Optional)

```bash
php artisan db:seed
```

### 7. Start Development Server

```bash
# Start Laravel
php artisan serve

# In another terminal, start Vite
npm install
npm run dev
```

**Access:** http://localhost:8000

## 🗂️ Database Structure

Your project uses **standard Laravel migrations** located in `database/migrations/`.

All migrations will create MySQL tables with:
- Primary keys (auto-increment)
- Foreign keys with proper constraints
- Indexes for better performance
- UTF8MB4 charset for emoji support

## 🔄 Migration from MongoDB Data

If you have existing MongoDB data, you need to export and import:

### Export from MongoDB

```bash
# Export to JSON
mongoexport --db=icafe_db --collection=users --out=users.json
mongoexport --db=icafe_db --collection=orders --out=orders.json
# ... repeat for all collections
```

### Import to MySQL

You'll need to write a custom import script or use Laravel seeders:

```php
// database/seeders/ImportMongoDataSeeder.php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class ImportMongoDataSeeder extends Seeder
{
    public function run()
    {
        // Read MongoDB exported JSON
        $users = json_decode(file_get_contents(database_path('imports/users.json')), true);
        
        foreach ($users as $userData) {
            User::create([
                'id' => $userData['_id']['$oid'] ?? null,
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => $userData['password'],
                // ... map other fields
            ]);
        }
    }
}
```

## 🚀 Using with Laragon

### Laragon Setup

1. **Start Laragon**
   - Start Apache and MySQL from Laragon

2. **Database is Ready**
   - Laragon automatically creates MySQL connection
   - Default: root / (no password)

3. **Run Project**
   ```bash
   cd C:\laragon\www\icafe
   composer install
   npm install
   php artisan migrate
   php artisan serve
   ```

4. **Access Application**
   - http://localhost:8000
   - Or use Laragon's pretty URL: http://icafe.test

### Laragon MySQL Access

- **phpMyAdmin**: http://localhost/phpmyadmin
- **HeidiSQL**: Built-in with Laragon
- **MySQL CLI**: From Laragon terminal

## ⚠️ Important Changes

### 1. **ID Fields**

**MongoDB:**
- Used `_id` as ObjectId
- String-based UUIDs

**MySQL:**
- Uses auto-increment `id` (bigint)
- If you used UUID, update migrations:

```php
$table->uuid('id')->primary();
```

### 2. **Timestamps**

Both work the same, but MySQL stores as DATETIME:

```php
$table->timestamps(); // created_at, updated_at
```

### 3. **JSON Fields**

MySQL 5.7+ supports JSON:

```php
// In migration
$table->json('metadata')->nullable();

// In model
protected $casts = [
    'metadata' => 'array',
];
```

### 4. **Relationships**

No changes needed! Laravel Eloquent relationships work the same.

### 5. **Full-Text Search**

If you used MongoDB text search:

**MongoDB:**
```php
$results = Model::where('$text', ['$search' => 'query'])->get();
```

**MySQL (Full-Text Index):**
```php
// Add to migration
$table->fullText(['name', 'description']);

// Query
$results = Model::whereRaw('MATCH(name, description) AGAINST(? IN BOOLEAN MODE)', [$query])->get();

// Or use Laravel Scout for better search
```

## 🐛 Common Issues

### Issue: "Class 'MongoDB\Laravel\Eloquent\Model' not found"

**Solution:**
```bash
composer dump-autoload
php artisan optimize:clear
```

### Issue: Migration fails

**Solution:**
- Check MySQL is running
- Verify database exists
- Check `.env` credentials
- Run: `php artisan config:clear`

### Issue: "SQLSTATE[HY000] [2002] No such file or directory"

**Solution for Windows/Laragon:**
```env
DB_HOST=127.0.0.1  # Use IP instead of 'localhost'
```

### Issue: "Syntax error or access violation: 1071 Specified key was too long"

**Solution:**
Add to `app/Providers/AppServiceProvider.php`:

```php
use Illuminate\Support\Facades\Schema;

public function boot()
{
    Schema::defaultStringLength(191);
}
```

## 📊 Performance Tips

### 1. Add Indexes

```php
// In migrations
$table->index('tenant_id');
$table->index('created_at');
$table->index(['user_id', 'status']);
```

### 2. Use Eager Loading

```php
// Prevent N+1 queries
$orders = Order::with(['items', 'customer', 'table'])->get();
```

### 3. Enable Query Caching

```php
// Cache query results
$menus = Cache::remember('menus', 3600, function () {
    return Menu::with('category')->get();
});
```

### 4. Use Database Transactions

```php
DB::transaction(function () {
    $order = Order::create([...]);
    $order->items()->createMany([...]);
});
```

## 📝 Testing

After conversion, test all features:

- [ ] User authentication
- [ ] Order creation
- [ ] Inventory management
- [ ] Customer operations
- [ ] Reports generation
- [ ] Table reservations
- [ ] Settings management

## 🆘 Need Help?

If you encounter issues:

1. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Clear caches:**
   ```bash
   php artisan optimize:clear
   ```

3. **Verify database connection:**
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

## ✅ Verification Checklist

- [ ] Composer dependencies installed
- [ ] `.env` file configured
- [ ] Database created
- [ ] Migrations run successfully
- [ ] Application key generated
- [ ] Development server running
- [ ] Can access homepage
- [ ] Can login/register
- [ ] All features working

## 🎉 You're Ready!

Your project now uses **MySQL** instead of MongoDB and runs **without Docker**.

Start developing:
```bash
php artisan serve
npm run dev
```

---

**Previous Setup:** MongoDB + Docker  
**Current Setup:** MySQL + Laragon (or any local PHP/MySQL environment)
