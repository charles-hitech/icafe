# 🔧 Quick Install Guide - Fix "Unsupported driver [mongodb]"

## The Error You're Seeing:

```
Unsupported driver [mongodb]
at vendor\laravel\framework\src\Illuminate\Database\Connectors\ConnectionFactory.php:280
```

**Cause:** MongoDB Laravel package is not installed yet.

---

## ✅ Solution (Choose ONE):

### **Option 1: Install via Laragon Terminal** ⭐ (Recommended)

1. **Open Laragon Terminal:**
   - Laragon → Menu → Terminal (or press Ctrl+Alt+T)

2. **Navigate to project:**
   ```bash
   cd cafe
   ```

3. **Install package:**
   ```bash
   composer require mongodb/laravel-mongodb --ignore-platform-req=ext-mongodb
   ```

4. **Clear cache:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

5. **Done!** The error should be fixed.

---

### **Option 2: Run Automated Script**

Double-click this file:
```
install-mongodb-package.bat
```

This will automatically install the package for you.

---

### **Option 3: Manual Composer Install**

If you have Composer in PATH:

```bash
cd D:\dev\program\laragon\www\cafe
composer install --ignore-platform-req=ext-mongodb
php artisan config:clear
```

---

## ⚠️ Important Notes:

### After Installing the Package:

You'll still need the **MongoDB PHP extension** to actually connect to MongoDB:

1. **Download extension:**
   - https://pecl.php.net/package/mongodb/2.0.0/windows
   - Get: `php_mongodb-2.x.x-8.4-ts-vs16-x64.zip`

2. **Install:**
   ```
   Extract php_mongodb.dll
   Copy to: D:\dev\program\laragon\bin\php\php-8.4.21-Win32-vs17-x64\ext\
   ```

3. **Enable in php.ini:**
   ```ini
   extension=mongodb
   ```

4. **Restart Laragon**

---

## 🔄 Alternative: Use MySQL Temporarily

If you want to run the app immediately without MongoDB:

**Edit `.env`:**
```env
# Comment out MongoDB
# DB_CONNECTION=mongodb

# Use MySQL instead
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=xeronew
DB_USERNAME=root
DB_PASSWORD=root
```

Then:
```bash
php artisan config:clear
php artisan serve
```

---

## 📋 Full Setup Checklist:

- [ ] Step 1: Install Composer package (this guide)
- [ ] Step 2: Install PHP MongoDB extension ([PHP84_MONGODB_SETUP.md](PHP84_MONGODB_SETUP.md))
- [ ] Step 3: Install/Start MongoDB server ([MONGODB_TROUBLESHOOTING.md](MONGODB_TROUBLESHOOTING.md))
- [ ] Step 4: Test connection (`test-mongodb.php`)
- [ ] Step 5: Run application (`php artisan serve`)

---

## 🧪 Verify Installation:

After running composer install, check if package is installed:

```bash
composer show mongodb/laravel-mongodb
```

You should see package details and version number.

---

## 🆘 Troubleshooting:

### "Composer not found"
**Solution:** Use Laragon Terminal (has Composer in PATH)

### "Your requirements could not be resolved"
**Solution:** Add `--ignore-platform-req=ext-mongodb` flag

### Still getting "Unsupported driver" error
**Solution:** 
```bash
php artisan config:clear
php artisan cache:clear
composer dump-autoload
```

### Package installed but still errors
**Solution:** The PHP extension is not installed yet. See [PHP84_MONGODB_SETUP.md](PHP84_MONGODB_SETUP.md)

---

## 📞 Quick Commands Reference:

```bash
# Install package
composer require mongodb/laravel-mongodb --ignore-platform-req=ext-mongodb

# Clear caches
php artisan config:clear
php artisan cache:clear

# Check if installed
composer show mongodb/laravel-mongodb

# Check PHP extension
php -m | findstr mongodb

# Test MongoDB connection
php test-mongodb.php

# Start app
php artisan serve
```

---

## 🎯 TL;DR (Too Long; Didn't Read):

**Open Laragon Terminal and run:**
```bash
cd cafe
composer require mongodb/laravel-mongodb --ignore-platform-req=ext-mongodb
php artisan config:clear
```

**Then install PHP extension** (see [QUICKSTART.md](QUICKSTART.md))

---

That's it! After installing the package, the "Unsupported driver" error will be gone! 🎉
