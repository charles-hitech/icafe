# 🚀 QUICK START - MongoDB with PHP 8.4

## ✅ What's Done
- All 26 models converted to MongoDB
- Database configuration updated
- Environment configured for MongoDB
- Composer package added

---

## 📋 What You Need to Do Now

### 1️⃣ **Download MongoDB PHP Extension** (REQUIRED)

**PHP 8.4 Extension is NOT included in Laragon by default!**

👉 **Download from:** https://pecl.php.net/package/mongodb/2.0.0/windows

Look for: `php_mongodb-2.x.x-8.4-ts-vs16-x64.zip`

📂 **Install to:**
```
D:\dev\program\laragon\bin\php\php-8.4.21-Win32-vs17-x64\ext\php_mongodb.dll
```

📝 **Enable in php.ini:**
```ini
extension=mongodb
```

🔄 **Restart Laragon!**

---

### 2️⃣ **Install MongoDB Server** (REQUIRED)

Choose ONE option:

**Option A: Local MongoDB** (For development)
- Download: https://www.mongodb.com/try/download/community
- Install and start: `net start MongoDB`

**Option B: MongoDB Atlas** (Cloud - Easier!)
- Sign up: https://www.mongodb.com/cloud/atlas/register
- Create free cluster
- Update `.env` with connection details

---

### 3️⃣ **Install Composer Packages**

**Option A: Run the automated script:**
```bash
setup-mongodb.bat
```

**Option B: Manual installation:**
```bash
composer install --ignore-platform-req=ext-mongodb
php artisan config:clear
```

---

### 4️⃣ **Test & Run**

```bash
# Test MongoDB connection
php artisan tinker
DB::connection('mongodb')->getMongoDB()->listCollections();
exit

# Start your app
php artisan serve
```

Visit: http://localhost:8000

---

## 🆘 Troubleshooting

### "Class 'MongoDB' not found"
→ PHP extension not installed (see Step 1)
→ Restart Laragon after installing

### "Unsupported driver [mongodb]"
→ Run: `composer install --ignore-platform-req=ext-mongodb`
→ Run: `php artisan config:clear`

### "Connection refused"
→ MongoDB server not running (see Step 2)
→ Start with: `net start MongoDB`

### "Extension DLL not found for PHP 8.4"
→ **Switch to PHP 8.3 in Laragon** (recommended)
→ Laragon Menu → PHP → Version → PHP 8.3
→ PHP 8.3 has full MongoDB support

---

## 📚 Full Documentation

- **Detailed Setup:** [PHP84_MONGODB_SETUP.md](PHP84_MONGODB_SETUP.md)
- **Migration Guide:** [MONGODB_MIGRATION_SUMMARY.md](MONGODB_MIGRATION_SUMMARY.md)
- **General MongoDB Guide:** [MONGODB_SETUP.md](MONGODB_SETUP.md)

---

## 🎯 Quick Commands

```bash
# Check if extension is loaded
php -m | findstr mongodb

# Get extension version
php -r "echo phpversion('mongodb');"

# Test MongoDB server
mongosh

# Laravel commands
php artisan config:clear
php artisan cache:clear
php artisan serve
```

---

## ⚡ TL;DR (Too Long; Didn't Read)

1. Download `php_mongodb.dll` → Put in `ext/` folder
2. Add `extension=mongodb` to `php.ini`
3. Restart Laragon
4. Install MongoDB or use Atlas
5. Run `setup-mongodb.bat`
6. Start app: `php artisan serve`

**OR just switch to PHP 8.3 in Laragon for easier setup!** 😊

---

Need help? See [PHP84_MONGODB_SETUP.md](PHP84_MONGODB_SETUP.md) for detailed instructions.
