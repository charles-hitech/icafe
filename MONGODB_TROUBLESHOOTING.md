# MongoDB Connection Troubleshooting Guide

## 🔍 Issue: Credentials Not Working

Your `.env` is now updated with multiple options. Choose the one that matches your setup.

---

## ✅ Solution 1: Local MongoDB WITHOUT Authentication (Recommended for Development)

This is the **default** and easiest setup for local development.

### Current .env Configuration:
```env
DB_CONNECTION=mongodb
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=
MONGODB_PASSWORD=
```
*(Leave username and password EMPTY)*

### Steps:

1. **Start MongoDB without authentication:**
   ```bash
   net start MongoDB
   ```

2. **Test connection:**
   ```bash
   mongosh
   ```
   
   If it connects without asking for password, you're good! Type `exit` to quit.

3. **Clear Laravel cache:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

4. **Test from Laravel:**
   ```bash
   php artisan tinker
   ```
   Then:
   ```php
   DB::connection('mongodb')->getMongoDB()->listCollections();
   exit
   ```

---

## ✅ Solution 2: Create MongoDB User WITH Authentication

If you want secure authentication:

### Step 1: Connect to MongoDB
```bash
mongosh
```

### Step 2: Switch to admin database
```javascript
use admin
```

### Step 3: Create admin user
```javascript
db.createUser({
  user: "cafe_admin",
  pwd: "SecurePassword123",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})
```

### Step 4: Create database-specific user
```javascript
use cafe_db
db.createUser({
  user: "cafe_user",
  pwd: "CafePassword123",
  roles: [
    { role: "readWrite", db: "cafe_db" }
  ]
})
```

### Step 5: Exit mongosh
```javascript
exit
```

### Step 6: Update .env
```env
DB_CONNECTION=mongodb
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=cafe_user
MONGODB_PASSWORD=CafePassword123
MONGODB_AUTH_SOURCE=cafe_db
```

### Step 7: Restart MongoDB with authentication
```bash
net stop MongoDB
net start MongoDB
```

### Step 8: Test
```bash
mongosh -u cafe_user -p CafePassword123 --authenticationDatabase cafe_db
```

---

## ✅ Solution 3: Use MongoDB Atlas (Cloud - No Local Setup)

### Step 1: Create Free Account
- Visit: https://www.mongodb.com/cloud/atlas/register
- Sign up for free

### Step 2: Create Cluster
- Click "Create Cluster"
- Choose FREE tier (M0)
- Select region closest to you
- Click "Create Cluster"

### Step 3: Create Database User
- Go to "Database Access"
- Click "Add New Database User"
- Username: `cafe_admin`
- Password: Create a secure password (save it!)
- Database User Privileges: "Read and write to any database"
- Click "Add User"

### Step 4: Whitelist Your IP
- Go to "Network Access"
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

### Step 5: Get Connection String
- Go to "Database" → "Connect"
- Choose "Connect your application"
- Copy the connection string:
  ```
  mongodb+srv://cafe_admin:<password>@cluster0.xxxxx.mongodb.net/
  ```

### Step 6: Update .env
```env
DB_CONNECTION=mongodb
MONGODB_HOST=cluster0.xxxxx.mongodb.net
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=cafe_admin
MONGODB_PASSWORD=your_actual_password
MONGODB_AUTH_SOURCE=admin
```

**Note:** Replace `<password>` and `cluster0.xxxxx.mongodb.net` with your actual values!

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Connection refused to 127.0.0.1:27017"
**Cause:** MongoDB server not running

**Fix:**
```bash
# Check if MongoDB is running
sc query MongoDB

# If not running, start it:
net start MongoDB

# If service doesn't exist, install MongoDB first
```

### Issue 2: "Authentication failed"
**Cause:** Wrong username/password or auth not configured

**Fix:**
- If using local without auth: Leave username/password EMPTY in .env
- If using with auth: Verify credentials in mongosh:
  ```bash
  mongosh -u your_username -p your_password --authenticationDatabase admin
  ```

### Issue 3: "Server selection timeout"
**Cause:** MongoDB not installed or wrong host

**Fix:**
- Verify MongoDB is installed:
  ```bash
  mongosh --version
  ```
- Check if it's running on correct port:
  ```bash
  netstat -an | findstr :27017
  ```

### Issue 4: "Class 'MongoDB' not found"
**Cause:** PHP MongoDB extension not installed

**Fix:**
1. Download extension from: https://pecl.php.net/package/mongodb
2. Copy `php_mongodb.dll` to: `D:\dev\program\laragon\bin\php\php-8.4.21-Win32-vs17-x64\ext\`
3. Add to php.ini: `extension=mongodb`
4. Restart Laragon
5. Verify: `php -m | findstr mongodb`

### Issue 5: "Unsupported driver [mongodb]"
**Cause:** Laravel MongoDB package not installed

**Fix:**
```bash
composer install --ignore-platform-req=ext-mongodb
php artisan config:clear
```

---

## 🧪 Test Your Connection

### Quick Test Script

Create `test-mongodb.php` in your project root:

```php
<?php
require 'vendor/autoload.php';

echo "Testing MongoDB Connection...\n\n";

// Test 1: Check if extension is loaded
if (extension_loaded('mongodb')) {
    echo "✓ MongoDB PHP extension is loaded\n";
    echo "  Version: " . phpversion('mongodb') . "\n\n";
} else {
    echo "✗ MongoDB PHP extension NOT loaded\n";
    echo "  Install extension first!\n\n";
    exit(1);
}

// Test 2: Try to connect
try {
    $host = getenv('MONGODB_HOST') ?: '127.0.0.1';
    $port = getenv('MONGODB_PORT') ?: '27017';
    $user = getenv('MONGODB_USERNAME');
    $pass = getenv('MONGODB_PASSWORD');
    
    if ($user && $pass) {
        $uri = "mongodb://{$user}:{$pass}@{$host}:{$port}";
    } else {
        $uri = "mongodb://{$host}:{$port}";
    }
    
    echo "Connecting to: {$host}:{$port}\n";
    $client = new MongoDB\Client($uri);
    
    // Test connection
    $databases = $client->listDatabases();
    echo "✓ Successfully connected to MongoDB!\n";
    echo "  Available databases:\n";
    foreach ($databases as $db) {
        echo "  - {$db['name']}\n";
    }
    echo "\n✓ Connection test PASSED!\n";
    
} catch (Exception $e) {
    echo "✗ Connection FAILED!\n";
    echo "  Error: " . $e->getMessage() . "\n\n";
    echo "Troubleshooting:\n";
    echo "1. Check if MongoDB is running: net start MongoDB\n";
    echo "2. Verify connection details in .env\n";
    echo "3. If using authentication, verify credentials\n";
    exit(1);
}
```

**Run it:**
```bash
php test-mongodb.php
```

---

## 📋 Quick Reference

### Without Authentication (Development):
```env
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=
MONGODB_PASSWORD=
```

### With Authentication (Production):
```env
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=cafe_user
MONGODB_PASSWORD=SecurePassword123
MONGODB_AUTH_SOURCE=cafe_db
```

### MongoDB Atlas (Cloud):
```env
MONGODB_HOST=cluster0.xxxxx.mongodb.net
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=atlas_user
MONGODB_PASSWORD=AtlasPassword123
MONGODB_AUTH_SOURCE=admin
```

---

## 🎯 Recommended Setup for You

For **local development**, use **Option 1** (no authentication):

1. ✅ Your `.env` is already configured correctly
2. ✅ Just make sure MongoDB is running: `net start MongoDB`
3. ✅ Clear cache: `php artisan config:clear`
4. ✅ Test: `php artisan tinker` then `DB::connection('mongodb')->getMongoDB()->listCollections();`

**That's it!** No username/password needed for local development! 🎉

---

## 🆘 Still Not Working?

Run these diagnostic commands:

```bash
# 1. Check if MongoDB is installed
mongosh --version

# 2. Check if MongoDB service exists
sc query MongoDB

# 3. Check if MongoDB is running
netstat -an | findstr :27017

# 4. Check if PHP extension is loaded
php -m | findstr mongodb

# 5. Check if Composer package is installed
composer show mongodb/laravel-mongodb

# 6. Try connecting with mongosh
mongosh mongodb://127.0.0.1:27017
```

Share the output if you need more help!
