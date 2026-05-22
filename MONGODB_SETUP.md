# MongoDB Configuration Guide

## Overview
This Laravel project has been configured to use MongoDB as the primary database. All models have been updated to use MongoDB Laravel package.

## Installation Steps

### 1. Install Composer Dependencies
Run this command in Laragon Terminal:
```bash
composer install
```

This will install the `mongodb/laravel-mongodb` package that has been added to `composer.json`.

### 2. Install MongoDB PHP Extension
Before running the application, ensure the MongoDB PHP extension is installed:

**For Laragon:**
1. Open Laragon Menu → PHP → PHP Extensions
2. Enable `php_mongodb` extension
3. Restart Laragon

**Or manually:**
- Download the appropriate `php_mongodb.dll` for your PHP version from [PECL](https://pecl.php.net/package/mongodb)
- Place it in your PHP `ext` directory
- Add `extension=mongodb` to your `php.ini`
- Restart your web server

### 3. Install MongoDB Server
If you don't have MongoDB installed:

**For Windows:**
- Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Install with default settings
- MongoDB will run on `localhost:27017` by default

**For Laragon:**
- Laragon doesn't include MongoDB by default, but you can add it manually
- Or use MongoDB Atlas (cloud) for development

### 4. Configure Environment Variables
The `.env` file has been updated with MongoDB configuration:

```env
DB_CONNECTION=mongodb

# MongoDB Configuration
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=
MONGODB_PASSWORD=
MONGODB_AUTH_SOURCE=admin
```

**Adjust these settings based on your MongoDB setup:**
- If using MongoDB Atlas (cloud), update `MONGODB_HOST` with your cluster URL
- Add username/password if authentication is enabled
- Change `MONGODB_DATABASE` to your preferred database name

### 5. Test MongoDB Connection
Create a test route or run this in Tinker:
```bash
php artisan tinker
```

Then test:
```php
DB::connection('mongodb')->getMongoDB()->listCollections();
```

## What Has Changed

### Models
All models in `app/Models/` now extend `MongoDB\Laravel\Eloquent\Model`:
- ✅ User (using `MongoDB\Laravel\Auth\User`)
- ✅ Category
- ✅ Order
- ✅ Menu
- ✅ Customer
- ✅ Tenant
- ✅ Addon
- ✅ ActivityLog
- ✅ CreditTransaction
- ✅ And 18 more models...

### Database Configuration
- `config/database.php` - Added MongoDB connection configuration
- `.env` - Updated to use MongoDB as default connection

### Tenant Scoping
- `app/Models/Scopes/TenantScope.php` - Updated to be MongoDB-compatible
- Removed table prefixes (MongoDB doesn't use table names the same way)

## Migration Considerations

### MongoDB vs MySQL Differences

**What Works the Same:**
- ✅ Eloquent relationships (hasMany, belongsTo, etc.)
- ✅ Query builder methods (where, orderBy, etc.)
- ✅ Model events and observers
- ✅ Authentication with MongoDB\Laravel\Auth\User
- ✅ Timestamps (created_at, updated_at)

**What's Different:**
- ❌ No migrations needed (MongoDB is schema-less)
- ❌ No foreign key constraints
- ❌ Joins are limited (use relationships instead)
- ✅ Can store arrays and nested documents directly
- ✅ Flexible schema (add fields without migrations)

### Data Migration from MySQL

If you have existing data in MySQL, you'll need to migrate it:

**Option 1: Export/Import**
```bash
# Export from MySQL
mysqldump -u root -p xeronew > backup.sql

# Use a migration script or tool to convert to MongoDB
# Tools: Studio 3T, mongify, custom PHP script
```

**Option 2: Run Both Databases**
Keep MySQL connection in `config/database.php` and migrate gradually:
```php
// In .env
DB_CONNECTION=mongodb  # Default

# Keep MySQL config for migration scripts
```

## Benefits of MongoDB for This Project

1. **Flexible Schema**: Add new fields to orders, menu items without migrations
2. **Embedded Documents**: Store order items as arrays within orders
3. **Performance**: Better for read-heavy operations (menu browsing)
4. **Scalability**: Easier horizontal scaling for multi-tenant architecture
5. **JSON Storage**: Direct storage of complex menu configurations, addons

## Common Issues & Solutions

### Issue: "Class 'MongoDB' not found"
**Solution:** Install the PHP MongoDB extension (see Step 2)

### Issue: "Connection refused"
**Solution:** Ensure MongoDB server is running:
```bash
# Check if MongoDB is running
net start MongoDB  # Windows
```

### Issue: "Authentication failed"
**Solution:** 
- If MongoDB is running without auth, leave MONGODB_USERNAME and MONGODB_PASSWORD empty
- Or create a user in MongoDB:
```javascript
use admin
db.createUser({
  user: "cafe_user",
  pwd: "password",
  roles: [ { role: "readWrite", db: "cafe_db" } ]
})
```

### Issue: "Primary key type mismatch"
**Solution:** MongoDB uses ObjectId (_id) by default. The Laravel MongoDB package handles this automatically. No changes needed.

## Development Workflow

### Creating New Models
```php
<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class YourModel extends Model
{
    protected $fillable = ['field1', 'field2'];
    
    // No migration needed! Just start using it
}
```

### Working with Embedded Documents
```php
// Store arrays directly
$order = Order::create([
    'items' => [
        ['name' => 'Coffee', 'price' => 5.00],
        ['name' => 'Cake', 'price' => 8.00]
    ]
]);

// Query nested fields
$orders = Order::where('items.name', 'Coffee')->get();
```

### Using MongoDB-Specific Features
```php
// Use MongoDB operators
Order::where('total_amount', '>', 100)->get();

// Array contains
Menu::where('addons', 'elemMatch', ['name' => 'Extra Cheese'])->get();
```

## Testing

### Run Tests with MongoDB
Your tests will now use MongoDB. Configure test database in `phpunit.xml`:

```xml
<env name="DB_CONNECTION" value="mongodb"/>
<env name="MONGODB_DATABASE" value="cafe_test"/>
```

## Production Deployment

1. **MongoDB Atlas** (Recommended for production):
   - Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Update `.env` with Atlas credentials

2. **Self-Hosted MongoDB**:
   - Install MongoDB on your server
   - Enable authentication
   - Configure firewall rules
   - Set up backups

## Additional Resources

- [MongoDB Laravel Package Documentation](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)
- [MongoDB PHP Library](https://www.mongodb.com/docs/php-library/)
- [MongoDB University](https://university.mongodb.com/) - Free courses

## Support

If you encounter issues:
1. Check MongoDB is running: `mongo` or `mongosh`
2. Verify PHP extension: `php -m | grep mongodb`
3. Test connection in Tinker
4. Review Laravel logs: `storage/logs/laravel.log`

---

**Note:** The previous MySQL configuration has been commented out in `.env` for reference. You can switch back by changing `DB_CONNECTION=mysql` if needed.
