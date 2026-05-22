# MongoDB with PHP 8.4 Setup Guide

## 🚀 Quick Start for PHP 8.4

Your project is now configured for MongoDB! Follow these steps:

---

## Step 1: Download MongoDB PHP Extension for PHP 8.4

Since PHP 8.4 is very recent, you'll need to download the extension manually:

### Option A: Download Pre-built DLL (Easiest)

1. **Visit PECL:**
   - Go to: https://pecl.php.net/package/mongodb/2.0.0/windows
   - Or: https://windows.php.net/downloads/pecl/releases/mongodb/

2. **Download the correct version:**
   - Look for: `php_mongodb-2.x.x-8.4-ts-vs16-x64.zip`
   - **ts** = Thread Safe (Laragon uses Thread Safe)
   - **x64** = 64-bit
   - **vs16** or **vs17** = Visual Studio version

3. **Extract and Install:**
   ```
   - Unzip the downloaded file
   - Find php_mongodb.dll
   - Copy to: D:\dev\program\laragon\bin\php\php-8.4.21-Win32-vs17-x64\ext\
   ```

### Option B: Compile from Source (Advanced)

If pre-built DLLs aren't available:
- Follow: https://www.php.net/manual/en/install.pecl.downloads.php
- Requires Visual Studio and PHP SDK

---

## Step 2: Enable the Extension

1. **Edit php.ini:**
   ```
   D:\dev\program\laragon\bin\php\php-8.4.21-Win32-vs17-x64\php.ini
   ```

2. **Add this line** (or uncomment if exists):
   ```ini
   extension=mongodb
   ```

3. **Save and close**

---

## Step 3: Install Composer Package

Open **Laragon Terminal** and run:

```bash
cd D:\dev\program\laragon\www\cafe

# Ignore platform requirements temporarily
composer install --ignore-platform-req=ext-mongodb

# Or if that doesn't work:
composer require mongodb/laravel-mongodb --ignore-platform-req=ext-mongodb
```

This installs the package even if the extension isn't detected yet.

---

## Step 4: Verify Extension is Loaded

After installing the DLL and enabling it:

1. **Restart Laragon** (important!)

2. **Check if extension is loaded:**
   ```bash
   php -m | findstr mongodb
   ```
   
   You should see: `mongodb`

3. **Check extension version:**
   ```bash
   php -r "echo phpversion('mongodb');"
   ```
   
   Should show: `2.x.x`

---

## Step 5: Install & Start MongoDB Server

### Option A: MongoDB Community Server (Local)

1. **Download:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, Latest Version
   - Download and install

2. **Start MongoDB:**
   ```bash
   # MongoDB installs as a Windows service by default
   net start MongoDB
   ```

3. **Verify it's running:**
   ```bash
   # Should connect to localhost:27017
   mongosh
   ```
   Type `exit` to quit

### Option B: MongoDB Atlas (Cloud) - Recommended

1. **Create free account:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free M0 cluster

2. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/`

3. **Update .env:**
   ```env
   MONGODB_HOST=cluster0.xxxxx.mongodb.net
   MONGODB_PORT=27017
   MONGODB_DATABASE=cafe_db
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_password
   MONGODB_AUTH_SOURCE=admin
   ```

---

## Step 6: Test the Connection

```bash
php artisan tinker
```

Then run:
```php
// Test MongoDB connection
DB::connection('mongodb')->getMongoDB()->listCollections();

// Create a test document
DB::connection('mongodb')->collection('test')->insert(['name' => 'Hello MongoDB!']);

// Read it back
DB::connection('mongodb')->collection('test')->first();

// Exit
exit
```

---

## Step 7: Run Your Application

```bash
# Clear config cache
php artisan config:clear

# Run the development server
php artisan serve
```

Visit: http://localhost:8000

---

## 🔧 Troubleshooting

### Problem: "Class 'MongoDB' not found"
**Solution:** The PHP extension isn't installed or enabled
- Check Step 1 & 2
- Restart Laragon
- Verify with: `php -m | findstr mongodb`

### Problem: "Unsupported driver [mongodb]"
**Solution:** The Laravel MongoDB package isn't installed
- Run: `composer install --ignore-platform-req=ext-mongodb`
- Clear config: `php artisan config:clear`

### Problem: "Connection refused to 127.0.0.1:27017"
**Solution:** MongoDB server isn't running
- Start MongoDB: `net start MongoDB`
- Or check if service exists: `sc query MongoDB`
- Or use MongoDB Atlas (cloud)

### Problem: "Authentication failed"
**Solution:** 
- If running MongoDB locally without auth, leave username/password blank in .env
- Or create a MongoDB user:
  ```javascript
  use admin
  db.createUser({
    user: "cafe_admin",
    pwd: "your_password",
    roles: [ { role: "readWrite", db: "cafe_db" } ]
  })
  ```

### Problem: Extension DLL not available for PHP 8.4
**Solution:** Use PHP 8.3 instead
1. Laragon → Menu → PHP → Version → PHP 8.3
2. Restart Laragon
3. Run `composer install` (no --ignore-platform-req needed)

---

## 📊 Data Migration from MySQL

If you have existing MySQL data:

### Option 1: Manual Export/Import Script

Create `migrate_to_mongodb.php`:

```php
<?php
require 'vendor/autoload.php';

// Connect to MySQL
$mysql = new PDO('mysql:host=127.0.0.1;dbname=xeronew', 'root', 'root');

// Connect to MongoDB
$mongo = new MongoDB\Client('mongodb://localhost:27017');
$db = $mongo->cafe_db;

// Migrate users
$users = $mysql->query('SELECT * FROM users')->fetchAll(PDO::FETCH_ASSOC);
foreach ($users as $user) {
    $db->users->insertOne($user);
}

echo "Migration complete!\n";
```

Run: `php migrate_to_mongodb.php`

### Option 2: Use Studio 3T (GUI Tool)
- Download: https://studio3t.com/download/
- Import data from MySQL to MongoDB visually

---

## ✅ What's Been Configured

### Models (All 26 models converted):
- ✅ User → MongoDB\Laravel\Auth\User
- ✅ Order, OrderItem, Menu, Category, Customer
- ✅ Inventory models (Item, Purchase, Usage)
- ✅ Tenant, Plan, Subscription
- ✅ All other models → MongoDB\Laravel\Eloquent\Model

### Configuration:
- ✅ composer.json → mongodb/laravel-mongodb added
- ✅ config/database.php → MongoDB connection configured
- ✅ .env → Using MongoDB as primary database
- ✅ TenantScope → MongoDB-compatible (no table prefixes)

---

## 🎯 Benefits of MongoDB

1. **No Migrations:** Schema-less database
2. **Flexible Fields:** Add/remove fields anytime
3. **Embedded Documents:** Store arrays and objects directly
4. **Better Performance:** For read-heavy operations
5. **Easy Scaling:** Horizontal scaling support

---

## 📚 MongoDB Query Examples

```php
// Create
Order::create([
    'items' => [
        ['name' => 'Coffee', 'price' => 5],
        ['name' => 'Cake', 'price' => 8]
    ]
]);

// Query nested fields
Order::where('items.name', 'Coffee')->get();

// Array operations
Menu::where('addons', 'all', ['Extra Cheese', 'Bacon'])->get();

// Update
Order::where('status', 'pending')->update(['status' => 'processing']);

// Aggregation
Order::raw(function($collection) {
    return $collection->aggregate([
        ['$match' => ['status' => 'completed']],
        ['$group' => ['_id' => '$customer_id', 'total' => ['$sum' => '$grand_total']]]
    ]);
});
```

---

## 🆘 Need Help?

- MongoDB Docs: https://docs.mongodb.com/
- Laravel MongoDB: https://www.mongodb.com/docs/drivers/php/laravel-mongodb/
- PHP Extension: https://www.php.net/manual/en/book.mongodb.php

---

## ⚡ Quick Commands Reference

```bash
# Install packages
composer install --ignore-platform-req=ext-mongodb

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Test MongoDB
php artisan tinker
DB::connection('mongodb')->getMongoDB()->listCollections();

# Start services
net start MongoDB                  # Start MongoDB (Windows)
php artisan serve                  # Start Laravel

# Check PHP extension
php -m | findstr mongodb           # Check if extension loaded
php -r "phpinfo();" | findstr mongodb  # Detailed info
```

---

**Current Status:** ✅ All models converted, configuration updated. Just install the PHP extension and MongoDB server!
