import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Users, Clock, Coffee, CheckCircle2, X, QrCode, Search, LayoutGrid, List } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function TableBook({ tables, menus }) {
    const { settings, tenant_slug } = usePage().props;
    const currency = settings?.currency_symbol || 'रू.';
    const siteName = settings?.site_name || 'CaféOS';

    const allCount       = tables.length;
    const availableCount = tables.filter(t => t.status === 'available').length;
    const occupiedCount  = tables.filter(t => t.status === 'occupied').length;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery]       = useState('');
    const [statusFilter, setStatusFilter]     = useState('all');
    const [viewMode, setViewMode]             = useState('grid');

    const { data, setData, post, processing, errors, reset } = useForm({
        table_number: '',
        capacity: 2,
        status: 'available'
    });

    const submitNewTable = (e) => {
        e.preventDefault();
        post(route('tables.store'), {
            onSuccess: () => { setIsAddModalOpen(false); reset(); }
        });
    };

    const filteredTables = useMemo(() => {
        return tables.filter(t => {
            const matchesSearch = t.table_number.toString().toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tables, searchQuery, statusFilter]);

    const statusTabs = [
        { key: 'all',       label: 'All Tables', count: allCount },
        { key: 'available', label: 'Available',  count: availableCount },
        { key: 'occupied',  label: 'Occupied',   count: occupiedCount },
    ];

    const cardColors = {
        available: {
            wrap:   'bg-white border-emerald-100 shadow-emerald-500/5',
            badge:  'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot:    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
            label:  'text-emerald-600',
            num:    'bg-emerald-50 text-emerald-800 border-emerald-100',
        },
        occupied: {
            wrap:   'bg-white border-red-100 shadow-red-500/5',
            badge:  'bg-red-50 text-red-700 border-red-200',
            dot:    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
            label:  'text-red-600',
            num:    'bg-red-50 text-red-800 border-red-100',
        },
    };

    const c = (status) => cardColors[status] || cardColors.available;

    return (
        <AuthenticatedLayout>
            <Head title="Table Book" />

            <div className="flex flex-col space-y-4 w-full">

                {/* ── Header ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900">Table Book</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mt-0.5">
                            <Clock className="w-3 h-3 mr-1 text-brand-500" />
                            Live Status &amp; Management
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                            <button onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                <List className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow shadow-brand-500/25 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                            Add Table
                        </button>
                    </div>
                </div>

                {/* ── Search + Filter Bar ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search table by number or name..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 bg-gray-50 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    {/* Status Filter Tabs */}
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shrink-0">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    statusFilter === tab.key
                                        ? tab.key === 'available' ? 'bg-emerald-600 text-white shadow'
                                        : tab.key === 'occupied' ? 'bg-red-600 text-white shadow'
                                        : 'bg-white text-brand-700 shadow'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.key !== 'all' && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        statusFilter === tab.key ? 'bg-white/80'
                                        : tab.key === 'available' ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}></span>
                                )}
                                {tab.label}
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black leading-none ${
                                    statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Empty state ── */}
                {filteredTables.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">No tables found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
                    </div>
                )}

                {/* ── Grid View ── */}
                {viewMode === 'grid' && filteredTables.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredTables.map(table => (
                            <div key={table.id}
                                className={`relative rounded-2xl border shadow-sm p-4 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${c(table.status).wrap}`}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`px-3 py-1.5 rounded-xl border font-black text-base leading-tight max-w-[70%] truncate ${c(table.status).num}`}>
                                        {table.table_number}
                                    </div>
                                    <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${c(table.status).dot}`}></span>
                                </div>

                                {/* Info row */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${c(table.status).badge}`}>
                                        {table.status}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-400">
                                        <Users className="w-3 h-3" />
                                        {table.capacity}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto flex flex-col gap-1.5">
                                    {table.status === 'available' && (
                                        <>
                                            <Link
                                                href={route('orders.create', { table_id: table.id })}
                                                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                                            >
                                                <Coffee className="w-3.5 h-3.5" />
                                                New Order
                                            </Link>
                                            {(settings?.enable_guest_qr === 'true' || settings?.enable_guest_qr === '1' || settings?.enable_guest_qr === 1 || settings?.enable_guest_qr === true) && (
                                                <button
                                                    onClick={() => {
                                                        const slug = tenant_slug || window.location.hostname.split('.')[0];
                                                        const url = `${window.location.origin}/${slug}/qro/${table.table_number}`;
                                                        navigator.clipboard.writeText(url).then(() => alert('Guest ordering link copied!\n' + url)).catch(() => prompt('Copy this QR link:', url));
                                                    }}
                                                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-all"
                                                >
                                                    <QrCode className="w-3 h-3" />
                                                    QR Link
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {table.status === 'occupied' && (
                                        <div className="flex flex-col gap-1">
                                            {table.orders[0]?.customer && (
                                                <p className="text-[10px] font-bold text-gray-500 truncate">{table.orders[0].customer.name}</p>
                                            )}
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] font-bold text-red-500 uppercase">Active Order</span>
                                                <span className="text-[11px] font-black text-red-700">{currency} {table.orders[0]?.total_amount || '0.00'}</span>
                                            </div>
                                            <Link
                                                href={`/orders/${table.orders[0]?.id}/edit`}
                                                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
                                            >
                                                <Coffee className="w-3.5 h-3.5" />
                                                Manage Order
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── List View ── */}
                {viewMode === 'list' && filteredTables.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Table</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Capacity</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Customer / Order</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTables.map(table => (
                                    <tr key={table.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`font-black text-sm px-2.5 py-1 rounded-lg border ${c(table.status).num}`}>{table.table_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-lg border w-fit ${c(table.status).badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c(table.status).dot}`}></span>
                                                {table.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                                <Users className="w-3.5 h-3.5" />{table.capacity} seats
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium text-gray-600">
                                            {table.status === 'occupied'
                                                ? <span className="flex items-center gap-2">
                                                    {table.orders[0]?.customer
                                                        ? <span className="font-bold text-gray-800">{table.orders[0].customer.name}</span>
                                                        : <span className="text-gray-400">—</span>
                                                    }
                                                    <span className="text-red-600 font-black">{currency} {table.orders[0]?.total_amount || '0.00'}</span>
                                                  </span>
                                                : <span className="text-gray-400">—</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {table.status === 'available' && (
                                                <Link
                                                    href={route('orders.create', { table_id: table.id })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                                                >
                                                    <Coffee className="w-3 h-3" />New Order
                                                </Link>
                                            )}
                                            {table.status === 'occupied' && (
                                                <Link
                                                    href={`/orders/${table.orders[0]?.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
                                                >
                                                    <Coffee className="w-3 h-3" />Manage
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Add Table Modal ── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white border border-gray-100 p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900">Add New Table</h3>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={submitNewTable} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Table Name / Number</label>
                                <input
                                    type="text"
                                    className={`w-full rounded-xl border ${errors.table_number ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/20'} bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 font-bold text-sm text-gray-800 transition-all`}
                                    placeholder="e.g. T-01, Window, Bar 3"
                                    value={data.table_number}
                                    onChange={e => setData('table_number', e.target.value)}
                                    autoFocus
                                    required
                                />
                                {errors.table_number && <p className="mt-1 text-xs font-bold text-red-500">{errors.table_number}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Seating Capacity</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-bold text-sm text-gray-800 transition-all"
                                        value={data.capacity}
                                        onChange={e => setData('capacity', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 shadow shadow-brand-500/20 transition-all disabled:opacity-70 text-sm mt-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {processing ? 'Creating...' : 'Create Table'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
