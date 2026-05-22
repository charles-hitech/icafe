# 🍵 Cafe Management System

Laravel-based cafe management system with **MongoDB** database support.

---

## 🎯 Current Status: MongoDB Configured for PHP 8.4

This project has been fully configured to use MongoDB as the primary database.

**✅ Completed:**
- All 26 models converted to MongoDB Eloquent
- Database configuration updated
- Multi-tenant support (MongoDB-compatible)
- Environment configured for MongoDB

**⚠️ Required Setup:**
- MongoDB PHP extension for PHP 8.4
- MongoDB server (local or Atlas)
- Composer package installation

---

## 🚀 Quick Start

### For PHP 8.4 Users:

**Read:** [QUICKSTART.md](QUICKSTART.md) ← Start here!

Or run the automated setup:
```bash
setup-mongodb.bat
```

### Prefer PHP 8.3?

Switch to PHP 8.3 in Laragon for easier setup (recommended):
1. Laragon → Menu → PHP → Version → PHP 8.3
2. Restart Laragon
3. Follow [QUICKSTART.md](QUICKSTART.md)

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide (start here!)
- **[PHP84_MONGODB_SETUP.md](PHP84_MONGODB_SETUP.md)** - Detailed PHP 8.4 + MongoDB guide
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - General MongoDB setup info
- **[MONGODB_MIGRATION_SUMMARY.md](MONGODB_MIGRATION_SUMMARY.md)** - What was changed

---

## 🔧 Technology Stack

- **Framework:** Laravel 12
- **Database:** MongoDB
- **Frontend:** Inertia.js + Vue
- **Authentication:** Laravel Sanctum
- **PHP Version:** 8.4 (or 8.3 recommended)
- **Package:** mongodb/laravel-mongodb

---

## 📦 Features

### Core Features:
- Multi-tenant architecture
- Order management
- Menu & category management
- Table reservations
- Inventory tracking
- Customer loyalty program
- Staff shift management
- Credit transactions
- Activity logging

### MongoDB Benefits:
- Schema-less design (no migrations needed)
- Flexible data structures
- Better performance for read operations
- Easy horizontal scaling
- Native support for arrays and embedded documents

---

## 🏗️ Project Structure

```
app/
├── Models/              # All MongoDB models
│   ├── User.php         # MongoDB Auth User
│   ├── Order.php        # Orders with embedded items
│   ├── Menu.php         # Menu items with categories
│   ├── Customer.php     # Customer management
│   └── ...              # 21 more models
├── Http/
│   ├── Controllers/     # Application controllers
│   └── Middleware/      # Custom middleware
└── Traits/
    └── BelongsToTenant.php  # Multi-tenancy trait

config/
└── database.php         # MongoDB connection config

database/
├── seeders/             # Database seeders
└── migrations/          # Legacy MySQL migrations (optional)
```

---

## 🎨 Models Converted to MongoDB

All **26 models** are MongoDB-ready:

**Core Business:**
- User, Order, OrderItem, Menu, Category
- Customer, Table, Reservation

**Inventory:**
- InventoryItem, InventoryPurchase, InventoryUsage
- StockGroup, MeasuringUnit, Supplier

**Financial:**
- CreditTransaction, Tax, Shift

**Multi-Tenancy:**
- Tenant, Plan, Subscription

**Others:**
- Addon, ActivityLog, Setting, LoyaltyReward
- Ticket, TicketMessage

---

## 🔐 Environment Configuration

Your `.env` is configured for MongoDB:

```env
DB_CONNECTION=mongodb
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=cafe_db
MONGODB_USERNAME=
MONGODB_PASSWORD=
```

To use MongoDB Atlas (cloud):
```env
MONGODB_HOST=your-cluster.mongodb.net
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
```

---

## 💻 Development Commands

```bash
# Install dependencies
composer install --ignore-platform-req=ext-mongodb

# Clear caches
php artisan config:clear
php artisan cache:clear

# Run development server
php artisan serve

# Test MongoDB connection
php artisan tinker
DB::connection('mongodb')->getMongoDB()->listCollections();
```

---

## 📖 MongoDB Query Examples

```php
// Create order with embedded items
Order::create([
    'customer_id' => 1,
    'items' => [
        ['menu_id' => 5, 'quantity' => 2, 'price' => 5.00],
        ['menu_id' => 8, 'quantity' => 1, 'price' => 8.00]
    ]
]);

// Query nested fields
Order::where('items.menu_id', 5)->get();

// Update arrays
Menu::where('name', 'Coffee')
    ->push('addons', ['name' => 'Extra Shot', 'price' => 1.00]);

// Aggregations
Order::raw(function($collection) {
    return $collection->aggregate([
        ['$group' => [
            '_id' => '$customer_id',
            'total' => ['$sum' => '$grand_total']
        ]]
    ]);
});
```

---

## 🛠️ Installation

### Prerequisites:
- PHP 8.3 or 8.4
- Composer
- MongoDB Server or Atlas account
- MongoDB PHP extension
- Node.js & NPM

### Steps:

1. **Clone the repository**
   ```bash
   cd D:\dev\program\laragon\www\cafe
   ```

2. **Install PHP MongoDB Extension**
   - See [QUICKSTART.md](QUICKSTART.md) for instructions

3. **Install dependencies**
   ```bash
   composer install --ignore-platform-req=ext-mongodb
   npm install
   ```

4. **Configure environment**
   - `.env` is already configured for MongoDB
   - Update MongoDB connection details if needed

5. **Start MongoDB**
   ```bash
   net start MongoDB  # Windows
   ```

6. **Build assets**
   ```bash
   npm run build
   ```

7. **Start server**
   ```bash
   php artisan serve
   ```

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=OrderTest
```

---

## 📝 Notes

### Why MongoDB?
- **Flexible Schema:** Add fields without migrations
- **Performance:** Faster reads for menu browsing
- **Scalability:** Easy horizontal scaling for multi-tenant
- **JSON Native:** Perfect for complex order structures

### Migration from MySQL
If you have existing MySQL data, see migration guide in [MONGODB_MIGRATION_SUMMARY.md](MONGODB_MIGRATION_SUMMARY.md)

---

## 🆘 Troubleshooting

**Issue:** "Class 'MongoDB' not found"  
**Fix:** Install PHP MongoDB extension (see [QUICKSTART.md](QUICKSTART.md))

**Issue:** "Unsupported driver [mongodb]"  
**Fix:** Run `composer install --ignore-platform-req=ext-mongodb`

**Issue:** "Connection refused"  
**Fix:** Start MongoDB server or check connection details

**Issue:** Extension not available for PHP 8.4  
**Fix:** Switch to PHP 8.3 in Laragon (recommended)

---

## 📚 Resources

- [Laravel Documentation](https://laravel.com/docs)
- [MongoDB Laravel Driver](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Inertia.js](https://inertiajs.com/)

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## 👥 Support

For setup help, see:
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
- [PHP84_MONGODB_SETUP.md](PHP84_MONGODB_SETUP.md) - Detailed guide

---

**Ready to start?** → Read [QUICKSTART.md](QUICKSTART.md)
