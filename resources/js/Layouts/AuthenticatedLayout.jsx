import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Table, CalendarDays, ShoppingBag, Coffee, ChevronRight, ChevronDown, Menu as MenuIcon, X, Settings, User, BarChart3, ChefHat, LogIn, LogOut, Clock, Users, Gift, FolderOpen, ListPlus, Percent, ConciergeBell, Boxes, Building2, Activity, Bell } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function AuthenticatedLayout({ children }) {
    const { auth, settings, active_orders_count, cancelled_orders_count, completed_today_count, kds_items_count, service_ready_count } = usePage().props;
    const user = auth.user;
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const [isNavigating, setIsNavigating] = useState(false);
    const searchParams = new URLSearchParams(window.location.search);
    const currentStatus = searchParams.get('status') || 'active';
    
    useEffect(() => {
        const start = router.on('start', () => setIsNavigating(true));
        const finish = router.on('finish', () => setIsNavigating(false));
        return () => {
            start();
            finish();
        };
    }, []);

    // Live sync: only poll pages that explicitly need real-time data.
    // Pages NOT in partialMapping (reports, analytics, settings, customers, etc.)
    // are skipped entirely — no background reload = no blinking.
    useEffect(() => {
        const isFormPage = route().current('*.create') || route().current('*.edit') || route().current('profile.*');
        if (isFormPage) return;

        // Partial Reload Mapping: route name → props to refresh.
        // Dashboard uses a slow 30s interval; operational views use 5s.
        // Any route NOT listed here gets NO auto-refresh.
        const partialMapping = {
            'dashboard':            { keys: ['stats', 'recent_activity', 'weekly_sales'], interval: 30000 },
            'superadmin.dashboard': { keys: ['stats', 'tenants', 'recentSubscriptions'], interval: 30000 },
            'table-book':           { keys: ['tables'],  interval: 5000 },
            'orders.index':         { keys: ['orders'],  interval: 5000 },
            'orders.service':       { keys: ['tables'],  interval: 5000 },
            'orders.kds':           { keys: ['items'],   interval: 3000 },
        };

        const currentRoute = route().current();
        const mapping = partialMapping[currentRoute];

        // This page doesn't need live polling — bail out immediately.
        if (!mapping) return;

        const interval = setInterval(() => {
            // Safety guards: skip if navigating or tab is hidden
            if (isNavigating || document.visibilityState !== 'visible') return;
            router.reload({
                preserveScroll: true,
                preserveState: true,
                only: mapping.keys,
            });
        }, mapping.interval);

        return () => clearInterval(interval);
    }, [route().current(), isNavigating]);

    const navItems = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard'), adminOnly: true },
        { name: 'Table Book', href: route('table-book'), icon: Table, active: route().current('table-book'), hideSuperAdmin: true },
        { name: 'Reservations', href: route('reservations.index'), icon: CalendarDays, active: route().current('reservations.*'), hideSuperAdmin: true },
        { 
            name: 'Orders', 
            href: route('orders.index'), 
            icon: ShoppingBag, 
            active: route().current('orders.*') && !route().current('orders.kds') && !route().current('orders.service'), 
            hideSuperAdmin: true
        },
        { name: 'Menu Items', href: route('menus.index'), icon: Coffee, active: route().current('menus.*') || route().current('categories.*') || route().current('addons.*'), adminOnly: true, hideSuperAdmin: true },
        { name: 'Inventory', href: route('inventory.index'), icon: Boxes, active: route().current('inventory.*'), adminOnly: true, hideSuperAdmin: true },
        { name: 'Kitchen KDS', href: route('orders.kds'), icon: ChefHat, active: route().current('orders.kds'), hideSuperAdmin: true, badge: kds_items_count, badgeColor: 'bg-amber-500' },
        { name: 'Service View', href: route('orders.service'), icon: ConciergeBell, active: route().current('orders.service'), hideSuperAdmin: true, badge: service_ready_count, badgeColor: 'bg-blue-500' },
        // { name: 'Loyalty', href: route('loyalty-rewards.index'), icon: Gift, active: route().current('loyalty-rewards.*'), adminOnly: true, hideSuperAdmin: true },
        { 
            name: 'Reports', 
            href: route('reports.index'), 
            icon: BarChart3, 
            active: route().current('reports.*'), 
            adminOnly: true, 
            hideSuperAdmin: true,
            submenu: [
                { name: 'Financial Report', href: route('reports.index'), active: route().current('reports.index') },
                { name: 'Advance Report', href: route('reports.analytics'), active: route().current('reports.analytics') }
            ]
        },
        { name: 'Customers', href: route('customers.index'), icon: Users, active: route().current('customers.*'), hideSuperAdmin: true },
        { 
            name: 'System Settings', 
            href: route('settings.index'), 
            icon: Settings, 
            active: route().current('settings.*') || route().current('taxes.*') || route().current('tenant.plan') || route().current('staff.performance') || route().current('support.*'), 
            adminOnly: true, 
            hideSuperAdmin: true,
            submenu: [
                { name: 'Global Settings', href: route('settings.index'), active: route().current('settings.*') },
                { name: 'Staff Performance', href: route('staff.performance'), active: route().current('staff.performance') },
                { name: 'Taxes', href: route('taxes.index'), active: route().current('taxes.*') },
                { name: 'My Plan', href: route('tenant.plan'), active: route().current('tenant.plan') },
                { name: 'Support Tickets', href: route('support.index'), active: route().current('support.*') }
            ]
        },
        
        // Super Admin Links
        { name: 'Global Dashboard', href: route('superadmin.dashboard'), icon: LayoutDashboard, active: route().current('superadmin.dashboard'), superAdminOnly: true },
        { name: 'Subscription Plans', href: route('superadmin.plans.index'), icon: Activity, active: route().current('superadmin.plans.*'), superAdminOnly: true },
        { name: 'Manage Cafes', href: route('superadmin.tenants.index'), icon: Building2, active: route().current('superadmin.tenants.*'), superAdminOnly: true },
        { name: 'Support Desk', href: route('superadmin.support.index'), icon: Activity, active: route().current('superadmin.support.*'), superAdminOnly: true },
        { name: 'Manage Users', href: route('superadmin.users.index'), icon: Users, active: route().current('superadmin.users.*'), superAdminOnly: true },
    ];

    const mobileNavItems = user?.role === 'super_admin' ? [
        { name: 'Stats', href: route('superadmin.dashboard'), icon: LayoutDashboard, active: route().current('superadmin.dashboard') },
        { name: 'Cafes', href: route('superadmin.tenants.index'), icon: Building2, active: route().current('superadmin.tenants.*') && !route().current('superadmin.tenants.create') },
        { name: 'Add Cafe', href: route('superadmin.tenants.create'), icon: ListPlus, active: route().current('superadmin.tenants.create') },
        { name: 'Users', href: route('superadmin.users.index'), icon: Users, active: route().current('superadmin.users.*') },
        { name: 'Plans', href: route('superadmin.plans.index'), icon: Activity, active: route().current('superadmin.plans.*') },
    ] : [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard'), adminOnly: true },
        { name: 'Table', href: route('table-book'), icon: Table, active: route().current('table-book') },
        { name: 'Order', href: route('orders.index'), icon: ShoppingBag, active: route().current('orders.*') && !route().current('orders.kds') && !route().current('orders.service') },
        { name: 'KDS', href: route('orders.kds'), icon: ChefHat, active: route().current('orders.kds') },
        { name: 'Service', href: route('orders.service'), icon: ConciergeBell, active: route().current('orders.service') },
    ];

    if (user?.role === 'kitchen') {
        return (
            <div className="flex min-h-screen bg-gray-900 font-sans text-white">
                <main className="flex-1 flex flex-col min-w-0 p-[2px] md:p-4 relative h-screen max-h-screen overflow-hidden">
                    <div className="absolute top-4 right-4 z-[60]">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 transition border border-gray-700 shadow-lg">
                                    <ChefHat className="h-5 w-5 text-gray-400" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" contentClasses="w-48 bg-gray-800 border border-gray-700 text-gray-200">
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-400 hover:bg-gray-700 w-full text-left font-bold">
                                    Sign Out Kitchen
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div data-theme={settings?.theme || 'blue'} className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Impersonation Banner */}
            {usePage().props.is_impersonating && (
                <div className="fixed top-0 inset-x-0 z-[100] bg-orange-600 text-white px-4 py-2 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 animate-pulse" />
                        <span className="text-sm font-bold tracking-wide">You are currently impersonating a cafe administrator.</span>
                    </div>
                    <Link
                        href={route('impersonate.stop')}
                        method="post"
                        as="button"
                        className="bg-white text-orange-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-orange-50 transition-colors shadow-sm"
                    >
                        Return to Superadmin
                    </Link>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm ${usePage().props.is_impersonating ? 'mt-12' : ''}`}>
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo Section */}
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="flex items-center space-x-3 group outline-none">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shadow-sm ${!settings?.site_logo ? 'bg-brand-600' : ''}`}>
                                    <ApplicationLogo className={settings?.site_logo ? "w-full h-full object-cover" : "h-6 w-6 text-white"} />
                                </div>
                                <div className="hidden lg:block">
                                    <span className="text-lg font-bold text-gray-900">{settings?.site_name || 'CaféOS'}</span>
                                    <p className="text-xs text-gray-500 -mt-0.5">Management System</p>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center space-x-1">
                                {navItems.filter(item => {
                                    if (user.role === 'super_admin') return item.superAdminOnly;
                                    if (item.superAdminOnly) return false;
                                    if (item.adminOnly && user.role !== 'admin') return false;
                                    return true;
                                }).map((item) => {
                                    const Icon = item.icon;
                                    
                                    if (item.submenu) {
                                        return (
                                            <Dropdown key={item.name}>
                                                <Dropdown.Trigger>
                                                    <button className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                                                        item.active
                                                        ? 'bg-brand-50 text-brand-700'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                                                    }`}>
                                                        <Icon className={`h-5 w-5 ${item.active ? 'text-brand-600' : ''}`} strokeWidth={2} />
                                                        <span>{item.name}</span>
                                                        <ChevronDown className={`h-4 w-4 ${item.active ? 'text-brand-500' : 'text-gray-500'}`} />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="left" contentClasses="w-56 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden py-1 mt-1">
                                                    {item.submenu.map(sub => (
                                                        <Dropdown.Link 
                                                            key={sub.name}
                                                            href={sub.href} 
                                                            className={`flex items-center justify-between py-2.5 px-4 text-sm font-medium transition-colors ${
                                                                sub.active 
                                                                ? 'bg-brand-50 text-brand-700 font-semibold' 
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                                                            }`}
                                                        >
                                                            <span>{sub.name}</span>
                                                            {sub.badge > 0 && (
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${sub.badgeColor || 'bg-brand-500'}`}>
                                                                    {sub.badge}
                                                                </span>
                                                            )}
                                                        </Dropdown.Link>
                                                    ))}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                                                item.active
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 ${item.active ? 'text-brand-600' : ''}`} strokeWidth={2} />
                                            <span>{item.name}</span>
                                            {item.badge > 0 && (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor || 'bg-brand-500'} animate-pulse`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right Section - User Menu */}
                        <div className="flex items-center space-x-3">
                            {/* User Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="group flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 outline-none">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                                            <User className="h-4 w-4" strokeWidth={2} />
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                                            <div className="flex items-center space-x-1 mt-0.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{user.role || 'Staff'}</p>
                                            </div>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block group-hover:text-gray-600 transition-colors" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right" contentClasses="w-56 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden py-1">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')} className="flex items-center py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700 transition-colors">
                                        <User className="h-5 w-5 mr-3 text-brand-600" strokeWidth={2} />
                                        Profile Settings
                                    </Dropdown.Link>
                                    {user.role === 'admin' && (
                                        <Dropdown.Link href={route('settings.index')} className="flex items-center py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700 transition-colors">
                                            <Settings className="h-5 w-5 mr-3 text-brand-600" strokeWidth={2} />
                                            System Settings
                                        </Dropdown.Link>
                                    )}
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center py-2.5 px-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                                        <LogOut className="h-5 w-5 mr-3" strokeWidth={2} />
                                        Sign Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* Mobile Menu Toggle */}
                            <button 
                                onClick={() => setIsMobileOpen(!isMobileOpen)} 
                                className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {isMobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMobileOpen && (
                        <div className="lg:hidden border-t border-gray-200 py-2 bg-white">
                            <nav className="space-y-1 px-2">
                                {navItems.filter(item => {
                                    if (user.role === 'super_admin') return item.superAdminOnly;
                                    if (item.superAdminOnly) return false;
                                    if (item.adminOnly && user.role !== 'admin') return false;
                                    return true;
                                }).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.name}>
                                            <Link
                                                href={item.href}
                                                onClick={() => !item.submenu && setIsMobileOpen(false)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                                                    item.active
                                                    ? 'bg-brand-50 text-brand-700'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Icon className={`h-5 w-5 ${item.active ? 'text-brand-600' : ''}`} strokeWidth={2.5} />
                                                    <span>{item.name}</span>
                                                </div>
                                                {item.badge > 0 && (
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor || 'bg-brand-500'}`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                            {item.submenu && item.active && (
                                                <div className="ml-4 mt-1 space-y-1 bg-gray-50 rounded-lg p-1.5">
                                                    {item.submenu.map(sub => (
                                                        <Link
                                                            key={sub.name}
                                                            href={sub.href}
                                                            onClick={() => setIsMobileOpen(false)}
                                                            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                                sub.active 
                                                                ? 'bg-white text-brand-700 font-semibold' 
                                                                : 'text-gray-700 hover:bg-white hover:text-brand-600'
                                                            }`}
                                                        >
                                                            <span>{sub.name}</span>
                                                            {sub.badge > 0 && (
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${sub.badgeColor || 'bg-brand-500'}`}>
                                                                    {sub.badge}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50 bg-white border border-gray-200 shadow-xl rounded-2xl px-2 py-2">
                <div className="flex items-center justify-between">
                    {mobileNavItems.filter(item => {
                        if (item.adminOnly && user.role !== 'admin') return false;
                        return true;
                    }).map((item) => {
                        const Icon = item.icon;
                        const isActive = item.active;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className="relative flex flex-col items-center justify-center h-14 w-14 rounded-lg outline-none group transition-all"
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-brand-50 rounded-lg -z-10"></div>
                                )}
                                <Icon className={`mb-0.5 transition-all ${isActive ? 'w-6 h-6 text-brand-600' : 'w-5 h-5 text-gray-500'}`} strokeWidth={2.5} />
                                <span className={`text-[9px] font-semibold transition-colors ${isActive ? 'text-brand-700' : 'text-gray-500'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
