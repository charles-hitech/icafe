# MongoDB Configuration Notes

## ⚠️ Important: Session & Cache Drivers

When using MongoDB, you **CANNOT** use `database` driver for sessions and cache because MongoDB doesn't support SQL `INSERT IGNORE` statements.

### ✅ Recommended Configuration (.env):

```env
# Use 'file' driver for sessions and cache with MongoDB
SESSION_DRIVER=file
CACHE_STORE=file

# Alternative: Use Redis (if installed)
# SESSION_DRIVER=redis
# CACHE_STORE=redis
```

### ❌ Don't Use:

```env
# These will cause errors with MongoDB:
SESSION_DRIVER=database   # ❌ Error: "database engine does not support inserting while ignoring errors"
CACHE_STORE=database      # ❌ Same error
```

---

## Common MongoDB Limitations in Laravel

### 1. **INSERT IGNORE Not Supported**
**Error:** "This database engine does not support inserting while ignoring errors"

**Solution:** Use `file` or `redis` for:
- `SESSION_DRIVER=file`
- `CACHE_STORE=file`
- Avoid database driver for sessions/cache

### 2. **Migrations**
MongoDB is schema-less, so traditional migrations don't apply. You can still use migrations for seeding data.

### 3. **Foreign Keys**
MongoDB doesn't enforce foreign key constraints. Use Eloquent relationships instead.

### 4. **Joins**
Limited join support. Use Eloquent relationships and eager loading:
```php
// Instead of joins, use relationships
Order::with('customer', 'items')->get();
```

### 5. **Transactions**
MongoDB supports transactions but requires replica sets. For development, you may not need transactions.

---

## MongoDB-Specific Features You Can Use

### 1. **Embedded Documents**
```php
Order::create([
    'customer_id' => 1,
    'items' => [  // Store array directly!
        ['product' => 'Coffee', 'price' => 5.00],
        ['product' => 'Cake', 'price' => 8.00]
    ]
]);
```

### 2. **Flexible Schema**
```php
// Add fields without migrations
Menu::create([
    'name' => 'Coffee',
    'price' => 5.00,
    'custom_field' => 'Any value'  // No migration needed!
]);
```

### 3. **Array Operations**
```php
// Push to array
Menu::where('name', 'Coffee')->push('tags', 'hot');

// Pull from array
Menu::where('name', 'Coffee')->pull('tags', 'cold');
```

### 4. **Aggregation**
```php
Order::raw(function($collection) {
    return $collection->aggregate([
        ['$match' => ['status' => 'completed']],
        ['$group' => [
            '_id' => '$customer_id',
            'total' => ['$sum' => '$grand_total']
        ]]
    ]);
});
```

---

## Performance Tips

### 1. **Use Indexes**
```php
// In your model
protected $indexes = [
    ['customer_id' => 1],
    ['created_at' => -1],
    ['status' => 1, 'created_at' => -1]  // Compound index
];
```

### 2. **Limit Fields**
```php
// Only fetch needed fields
Menu::select('name', 'price')->get();
```

### 3. **Use Cursor for Large Datasets**
```php
Order::cursor()->each(function ($order) {
    // Process one at a time
});
```

---

## Configuration Checklist

When using MongoDB with Laravel:

- [x] DB_CONNECTION=mongodb
- [x] SESSION_DRIVER=file (not database)
- [x] CACHE_STORE=file (not database)
- [x] Models extend MongoDB\Laravel\Eloquent\Model
- [x] User extends MongoDB\Laravel\Auth\User
- [ ] Optional: QUEUE_CONNECTION=redis (if using queues)

---

## Quick Fix Commands

If you encounter session/cache errors:

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Or run the fix script
fix-session-cache-error.bat
```

---

## When to Use MySQL vs MongoDB

### Use MySQL when:
- You need strong ACID transactions
- Complex joins are required
- Referential integrity is critical
- Team is more familiar with SQL

### Use MongoDB when:
- Flexible schema needed
- Storing complex nested data
- Rapid prototyping
- Horizontal scaling required
- Working with JSON-like documents

---

## Hybrid Approach (Optional)

You can use both MySQL and MongoDB in the same Laravel app:

```php
// Use MongoDB for main data
Order::on('mongodb')->create([...]);

// Use MySQL for sessions/cache
config(['cache.default' => 'database']);
```

Configure in `config/database.php`:
```php
'connections' => [
    'mysql' => [...],
    'mongodb' => [...]
]
```

---

This project is configured for **MongoDB-only** mode with file-based sessions and cache.
