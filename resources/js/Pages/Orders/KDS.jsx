import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Clock, CheckCircle2, Play, AlertCircle, Coffee, ChevronRight, Hash, User, AlertTriangle, Flame, Timer } from 'lucide-react';
import { useState, useEffect } from 'react';

const formatDuration = (start, end = new Date()) => {
    if (!start) return '--:--';
    // Ensure accurate calculation regardless of timezone offsets
    const diff = Math.max(0, Math.floor((new Date(end) - new Date(start)) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getElapsedMins = (start, end = new Date()) => {
    if (!start) return 0;
    const diffMs = new Date(end) - new Date(start);
    return Math.max(0, Math.floor(diffMs / 60000));
};

export default function KDS({ items, kds_warning_mins = 10, kds_critical_mins = 20 }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        // Sync handled globally by AuthenticatedLayout (3s)

        return () => clearInterval(timer);
    }, []);

    const updateStatus = (itemId, status) => {
        router.post(route('order-items.update-status', itemId), { status }, {
            preserveScroll: true
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ready': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getUrgency = (item) => {
        const startRef = item.started_at || item.created_at;
        const mins = getElapsedMins(startRef, currentTime);
        if (mins >= kds_critical_mins) return 'critical';
        if (mins >= kds_warning_mins) return 'warning';
        return 'normal';
    };

    const getCardStyles = (item) => {
        const urgency = getUrgency(item);
        if (urgency === 'critical') return 'ring-2 ring-red-400 bg-red-50/30 border-red-300';
        if (urgency === 'warning') return 'ring-2 ring-amber-400 bg-amber-50/20 border-amber-300';
        if (item.kds_status === 'preparing') return 'ring-2 ring-blue-400/20 bg-blue-50/10 border-blue-200';
        return 'border-gray-200';
    };

    const getTimerStyles = (item) => {
        const urgency = getUrgency(item);
        if (urgency === 'critical') return 'bg-red-100 text-red-700 border border-red-200';
        if (urgency === 'warning') return 'bg-amber-100 text-amber-700 border border-amber-200';
        return 'bg-gray-100 text-gray-600';
    };

    const criticalCount = items.filter(i => getUrgency(i) === 'critical').length;
    const warningCount = items.filter(i => getUrgency(i) === 'warning').length;

    return (
        <AuthenticatedLayout>
            <Head title="Kitchen Display System" />

            <div className="flex flex-col space-y-4 pb-10">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Kitchen Display System</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Live order preparation tracking</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {criticalCount > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-red-50 rounded-lg border border-red-200 animate-pulse">
                                <Flame className="w-3.5 h-3.5 text-red-500 mr-1.5" />
                                <span className="text-xs font-semibold text-red-700">{criticalCount} Critical</span>
                            </div>
                        )}
                        {warningCount > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                                <span className="text-xs font-semibold text-amber-700">{warningCount} Overdue</span>
                            </div>
                        )}
                        <div className="flex items-center px-3 py-1.5 bg-brand-50 rounded-lg border border-brand-100">
                            <Clock className="w-3.5 h-3.5 text-brand-600 mr-1.5" />
                            <span className="text-xs font-semibold text-brand-700">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KDS Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {items.length === 0 ? (
                        <div className="md:col-span-2 xl:col-span-3 2xl:col-span-4 flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200">
                            <Coffee className="w-12 h-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-bold text-gray-400">No Active Orders</h3>
                            <p className="text-sm text-gray-500 mt-1">Kitchen is all caught up!</p>
                        </div>
                    ) : (
                        items.map(item => {
                            const urgency = getUrgency(item);
                            const startRef = item.started_at || item.created_at;
                            const elapsedMins = getElapsedMins(startRef, currentTime);
                            const isCooking = item.kds_status === 'preparing';
                            
                            return (
                                <div
                                    key={item.id}
                                    className={`flex flex-col p-4 rounded-xl border bg-white shadow-sm transition-all duration-300 ${getCardStyles(item)}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`h-9 w-9 flex items-center justify-center rounded-lg font-bold text-xs bg-gray-50 text-gray-700 border border-gray-200`}>
                                                {item.order.table.table_number}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <p className="text-[10px] font-semibold text-gray-500 leading-none">
                                                        Order #{item.order.order_number || item.order.id.toString().slice(-8)}
                                                    </p>
                                                    {getElapsedMins(item.created_at, currentTime) < 1 && (
                                                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[8px] font-bold rounded uppercase animate-bounce">New</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 leading-none">
                                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-semibold uppercase border ${getStatusColor(item.kds_status)}`}>
                                            {item.kds_status}
                                        </span>
                                    </div>


                                    <div className="flex-1 mb-3 flex items-start gap-3">
                                        {/* Image Thumbnail */}
                                        <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center relative ${urgency === 'critical' ? 'border-red-200' : 'border-gray-200'}`}>
                                            {item.menu?.image_url ? (
                                                <img 
                                                    src={item.menu.image_url} 
                                                    alt={item.menu.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                                    <Coffee className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>


                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2">
                                                {item.quantity}x {item.menu?.name}
                                            </h3>
                                            
                                            {item.addons && item.addons.length > 0 && (
                                                <div className="flex flex-col gap-0.5 mb-2">
                                                    {item.addons.map((adn, idx) => (
                                                        <span key={idx} className="text-[10px] font-semibold text-brand-600">
                                                            + {adn.pivot?.addon_name || adn.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Timer Badge */}
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${getTimerStyles(item)}`}>
                                                {urgency === 'critical' ? (
                                                    <Flame className="w-3 h-3 animate-pulse" />
                                                ) : isCooking ? (
                                                    <Timer className="w-3 h-3 text-blue-600" />
                                                ) : (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                <span className="opacity-75">{isCooking ? 'Cooking:' : 'Wait:'}</span>
                                                <span className="font-bold text-[11px]">{formatDuration(startRef, currentTime)}</span>
                                                {urgency === 'critical' && <span className="font-bold text-red-600">!!</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {item.kds_status === 'pending' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'preparing')}
                                                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center"
                                            >
                                                <Play className="w-3.5 h-3.5 mr-1.5" />
                                                Start Preparing
                                            </button>
                                        )}
                                        {item.kds_status === 'preparing' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'ready')}
                                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                Mark as Ready
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
