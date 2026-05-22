import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router, Deferred } from '@inertiajs/react';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    Coffee,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Clock,
    LayoutGrid,
    ChevronRight,
    Activity,
    Calendar,
    LogOut,
    LogIn,
    Info,
    CheckCircle2,
    User,
    Banknote,
    Wifi,
    Timer,
    X
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export default function Dashboard({ stats, recent_activity, weekly_sales, filters }) {
    const { settings, trial } = usePage().props;
    const currency = settings?.currency_symbol || 'रू.';
    const siteName = settings?.site_name || 'CaféOS';

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [trialBannerVisible, setTrialBannerVisible] = useState(() => {
        return !sessionStorage.getItem('trial_banner_dismissed');
    });

    const dismissTrialBanner = () => {
        sessionStorage.setItem('trial_banner_dismissed', '1');
        setTrialBannerVisible(false);
    };

    const handleFilter = () => {
        router.get(route('dashboard'), {
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Sync handled globally by AuthenticatedLayout

    // Auto-filter when dates change
    useEffect(() => {
        if (startDate !== filters.start_date || endDate !== filters.end_date) {
            handleFilter();
        }
    }, [startDate, endDate]);

    const formatCurrency = (amount) => {
        return `${currency} ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const calculateGrowth = (current, previous) => {
        if (!previous || previous === 0) return 100;
        return ((current - previous) / previous) * 100;
    };
    
    const formatDuration = (mins) => {
        if (!mins || mins === 0) return 'N/A';
        const days = Math.floor(mins / 1440);
        const hours = Math.floor((mins % 1440) / 60);
        const m = Math.round(mins % 60);
        
        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (m > 0 || (days === 0 && hours === 0)) result += `${m}m`;
        return result.trim();
    };

    const dailyGrowth = calculateGrowth(stats.today_sales, stats.yesterday_sales);

    // Dynamic scale for the chart
    const maxSales = useMemo(() => {
        if (!weekly_sales) return 1;
        return Math.max(...weekly_sales.map(s => s.total), 1);
    }, [weekly_sales]);

    const statCards = [
        {
            title: "Today's Revenue",
            value: formatCurrency(stats.today_sales),
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            trend: dailyGrowth >= 0 ? 'up' : 'down',
            trendValue: `${Math.abs(dailyGrowth).toFixed(1)}%`,
            breakdown: [
                { label: 'Cash', value: formatCurrency(stats.today_cash || 0), icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50/80' },
                { label: 'Online', value: formatCurrency(stats.today_online || 0), icon: Wifi, color: 'text-blue-600', bg: 'bg-blue-50/80' },
            ]
        },
        {
            title: "Active Tables",
            value: stats.active_tables,
            icon: LayoutGrid,
            color: "text-brand-600",
            bg: "bg-brand-50",
            sub: `Out of ${stats.total_tables} total`
        },
        {
            title: "Monthly Sales",
            value: formatCurrency(stats.monthly_sales),
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50",
            sub: "Current Month"
        },
        {
            title: "Menu Items",
            value: stats.total_items,
            icon: Coffee,
            color: "text-orange-600",
            bg: "bg-orange-50",
            sub: "Active on Menu"
        },
        {
            title: "Avg Turnaround",
            value: formatDuration(stats.avg_turnaround_mins),
            icon: Timer,
            color: "text-amber-600",
            bg: "bg-amber-50",
            sub: "Today's avg service time"
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Analytics Dashboard" />

            {/* Trial Expired Lockout Overlay */}
            {trial?.is_expired && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-4">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Trial Expired</h2>
                        <p className="text-gray-500 mb-8">Your 30-day free trial has expired. To continue using CREMA.OS and regain access to your dashboard, please select a subscription plan.</p>
                        <a href="/#pricing" className="block w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors">View Pricing Plans</a>
                    </div>
                </div>
            )}

            <div className="flex flex-col space-y-4 w-full pb-6">
                {/* Trial Active Banner */}
                {!trial?.is_expired && trial && trialBannerVisible && (
                    <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                                <Info className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-900">Trial Period Active</h4>
                                <p className="text-[10px] font-medium text-gray-600">You have {trial.days_remaining} days remaining on your free trial.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href="/#pricing" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm">Upgrade &rarr;</a>
                            <button onClick={dismissTrialBanner} className="p-1 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900">Dashboard Overview</h1>
                        <p className="mt-0.5 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                            <Activity className="w-3 h-3 mr-1.5 text-brand-500" />
                            {siteName} Performance Metrics
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2 bg-white/70 border border-brand-100/80 shadow-sm rounded-xl px-3 py-1.5 w-full sm:w-auto">
                            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 shadow-sm shrink-0">
                                <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1 group cursor-pointer">
                                <span className="text-[8px] font-black text-brand-400 uppercase tracking-widest leading-none mb-0.5">From</span>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none p-0 text-[10px] font-black text-gray-800 focus:ring-0 focus:outline-none cursor-pointer w-full leading-tight" />
                            </div>
                            <div className="flex items-center justify-center shrink-0">
                                <div className="flex items-center gap-0.5">
                                    <div className="w-2.5 h-px bg-gradient-to-r from-brand-300 to-purple-300"></div>
                                    <div className="w-1.5 h-1.5 border-r-2 border-t-2 border-purple-400 rotate-45 -ml-1"></div>
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1 group cursor-pointer">
                                <span className="text-[8px] font-black text-brand-400 uppercase tracking-widest leading-none mb-0.5">To</span>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none p-0 text-[10px] font-black text-gray-800 focus:ring-0 focus:outline-none cursor-pointer w-full leading-tight" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Link href={route('table-book')}
                                className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 text-xs">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Table Book</span>
                            </Link>
                            <button onClick={() => window.location.href = route('table-book')}
                                className="flex-1 sm:flex-none bg-brand-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all flex items-center justify-center gap-1.5 text-xs">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>New Order</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white border border-gray-100 p-3 md:p-4 rounded-2xl shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-2 md:mb-3">
                                <div className={`p-2 md:p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                                </div>
                                {stat.trend && (
                                    <div className={`flex items-center space-x-0.5 px-1.5 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black ${stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                        {stat.trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                        <span>{stat.trendValue}</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.title}</h3>
                            <p className="text-base md:text-xl font-black text-gray-900 mt-0.5 leading-tight">{stat.value}</p>
                            {stat.sub && (
                                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
                            )}
                            {stat.breakdown && (
                                <div className="mt-2 pt-2 border-t border-gray-100/80 grid grid-cols-2 gap-1.5">
                                    {stat.breakdown.map((b, bi) => {
                                        const BIcon = b.icon;
                                        return (
                                            <div key={bi} className={`flex flex-col items-start p-1.5 rounded-lg ${b.bg}`}>
                                                <div className={`flex items-center gap-0.5 mb-0.5 ${b.color}`}>
                                                    <BIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                                                    <span className="text-[7px] font-black uppercase tracking-wider">{b.label}</span>
                                                </div>
                                                <span className={`text-[9px] md:text-[10px] font-black ${b.color} leading-tight`}>{b.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Sales Trend Chart */}
                    <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[320px]">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm md:text-base font-black text-gray-900">Sales Trend</h2>
                                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Analytics for Selected Period</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase mb-0.5">Period Revenue</p>
                                <p className="text-sm md:text-xl font-black text-brand-600 tracking-tighter leading-none">{formatCurrency(stats.total_sales)}</p>
                            </div>
                        </div>

                        <div className="px-4 pb-3 pt-2 flex-1 flex flex-col justify-end min-h-[220px]">
                            <Deferred data="weekly_sales" fallback={
                                <div className="h-full w-full flex items-end justify-between gap-2 px-2">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-gray-100 animate-pulse rounded-t-lg" style={{ height: `${Math.random() * 40 + 20}%` }}></div>
                                    ))}
                                </div>
                            }>
                                <div className="flex items-end justify-between h-full gap-1.5 md:gap-3 px-1">
                                    {weekly_sales?.map((item, i) => {
                                        const heightPercent = (item.total / maxSales) * 100;
                                        const isToday = item.day === CarbonToday() && item.date === CarbonDate();
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group h-full">
                                                <div className="relative w-full h-full flex flex-col justify-end">
                                                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-xl whitespace-nowrap font-black">
                                                        {formatCurrency(item.total)}
                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45"></div>
                                                    </div>
                                                    <div
                                                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                        className={`w-full max-w-[36px] min-h-[4px] mx-auto rounded-t-lg cursor-pointer relative shadow-sm ${
                                                            isToday ? 'bg-brand-600 shadow-brand-200' : 'bg-gradient-to-t from-brand-100 to-brand-500/60'
                                                        }`}
                                                    >
                                                        {isToday && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-600 rounded-full animate-ping"></div>}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <p className={`text-[9px] font-black uppercase leading-none ${isToday ? 'text-brand-600' : 'text-gray-800'}`}>{item.day}</p>
                                                    <p className="text-[7px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{item.date}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Deferred>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-black text-gray-900">Activity Feed</h2>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Live Operation Log</p>
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
                            </div>
                        </div>

                        <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto max-h-[320px] relative no-scrollbar">
                            <div className="absolute left-[35px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-100 via-brand-600/30 to-brand-100"></div>

                            <Deferred data="recent_activity" fallback={
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-start space-x-3 animate-pulse">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100"></div>
                                            <div className="flex-1 space-y-1.5 py-1">
                                                <div className="h-2 bg-gray-100 rounded w-1/4"></div>
                                                <div className="h-2.5 bg-gray-100 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }>
                                {recent_activity?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-50">
                                        <Activity className="w-8 h-8 text-gray-300 mb-1.5" />
                                        <p className="text-xs font-bold text-gray-400">System Ready</p>
                                    </div>
                                ) : (
                                    recent_activity?.map((item) => (
                                        <div key={item.id} className="relative flex items-start space-x-3 group">
                                            <div className="relative z-10">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm border transition-all duration-300 group-hover:scale-110 ${getIconStyles(item.icon_type)}`}>
                                                    {getActivityIconSm(item.icon_type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 pt-0.5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-600/80 mb-0.5">{item.action}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase">{item.time_ago}</p>
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-800 leading-snug">{item.description}</p>
                                                {item.user && (
                                                    <p className="text-[9px] font-bold text-gray-400 mt-1 flex items-center">
                                                        <User className="w-2.5 h-2.5 mr-0.5" />
                                                        {item.user.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </Deferred>
                        </div>

                        <div className="px-4 py-2 border-t border-gray-100">
                            <p className="text-[9px] font-black text-center text-gray-400 uppercase tracking-widest">End of Recent Activity</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Icon Mapping for Activity Feed
function getActivityIcon(type) {
    switch(type) {
        case 'order': return <ShoppingBag className="w-5 h-5" />;
        case 'menu': return <Coffee className="w-5 h-5" />;
        case 'staff': return <Users className="w-5 h-5" />;
        case 'reservation': return <Calendar className="w-5 h-5" />;
        case 'customer': return <User className="w-5 h-5" />;
        default: return <Info className="w-5 h-5" />;
    }
}

function getActivityIconSm(type) {
    switch(type) {
        case 'order': return <ShoppingBag className="w-3.5 h-3.5" />;
        case 'menu': return <Coffee className="w-3.5 h-3.5" />;
        case 'staff': return <Users className="w-3.5 h-3.5" />;
        case 'reservation': return <Calendar className="w-3.5 h-3.5" />;
        case 'customer': return <User className="w-3.5 h-3.5" />;
        default: return <Info className="w-3.5 h-3.5" />;
    }
}

function getIconStyles(type) {
    switch(type) {
        case 'order': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'menu': return 'bg-brand-50 text-brand-600 border-brand-100';
        case 'staff': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'reservation': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'customer': return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
}

// Helpers for current time comparison
function CarbonToday() {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date());
}

function CarbonDate() {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date());
}
