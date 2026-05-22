import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { Activity, CheckCircle2 } from 'lucide-react';

export default function MyPlan() {
    const { trial, auth } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="My Subscription Plan" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-stone-900">Subscription Plan</h1>
                            <p className="text-sm font-bold text-stone-400 mt-1 uppercase tracking-widest">Manage your CREMA.OS access</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                            <Activity className="h-6 w-6" />
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className={`rounded-2xl p-6 border ${trial?.is_expired ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                                    <h3 className={`text-sm font-black uppercase tracking-widest ${trial?.is_expired ? 'text-red-800' : 'text-orange-800'}`}>
                                        {trial?.is_expired ? 'Trial Expired' : 'Active Free Trial'}
                                    </h3>
                                </div>
                                <p className={`text-2xl font-black ${trial?.is_expired ? 'text-red-900' : 'text-orange-900'}`}>
                                    {trial?.is_expired ? '0 Days Remaining' : `${trial?.days_remaining} Days Remaining`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center p-12 border-2 border-dashed border-stone-200 rounded-2xl">
                        <h3 className="text-lg font-bold text-stone-900">Subscription Management</h3>
                        <p className="text-stone-500 mt-2">The ability to upgrade your plan and add a payment method is coming soon.</p>
                        <a href="/#pricing" className="inline-block mt-6 px-6 py-3 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-colors">
                            View Pricing Plans
                        </a>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
