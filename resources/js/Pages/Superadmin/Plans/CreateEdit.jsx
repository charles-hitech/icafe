import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function CreateEdit({ plan }) {
    const isEdit = !!plan;

    const { data, setData, post, put, processing, errors } = useForm({
        name: plan?.name || '',
        description: plan?.description || '',
        price_monthly: plan?.price_monthly || 0,
        price_3_months: plan?.price_3_months || 0,
        price_6_months: plan?.price_6_months || 0,
        price_yearly: plan?.price_yearly || 0,
        trial_days: plan?.trial_days || 0,
        features: plan?.features ? plan.features.join('\n') : '',
        is_active: plan?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        
        // Transform features string to array
        const submitData = {
            ...data,
            features: data.features.split('\n').filter(f => f.trim() !== '')
        };

        if (isEdit) {
            put(route('superadmin.plans.update', plan.id), { data: submitData });
        } else {
            post(route('superadmin.plans.store'), { data: submitData });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Plan' : 'Add Plan'} />

            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href={route('superadmin.plans.index')} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Plan' : 'Add New Plan'}</h2>
                        <p className="mt-1 text-sm text-gray-500">Configure subscription plan pricing and features.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <InputLabel htmlFor="name" value="Plan Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="col-span-2">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
                                    rows="2"
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price_monthly" value="Monthly Price ($)" />
                                <TextInput
                                    id="price_monthly"
                                    type="number"
                                    step="0.01"
                                    name="price_monthly"
                                    value={data.price_monthly}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('price_monthly', e.target.value)}
                                />
                                <InputError message={errors.price_monthly} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price_3_months" value="3 Months Price ($)" />
                                <TextInput
                                    id="price_3_months"
                                    type="number"
                                    step="0.01"
                                    name="price_3_months"
                                    value={data.price_3_months}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('price_3_months', e.target.value)}
                                />
                                <InputError message={errors.price_3_months} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price_6_months" value="6 Months Price ($)" />
                                <TextInput
                                    id="price_6_months"
                                    type="number"
                                    step="0.01"
                                    name="price_6_months"
                                    value={data.price_6_months}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('price_6_months', e.target.value)}
                                />
                                <InputError message={errors.price_6_months} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price_yearly" value="Yearly Price ($)" />
                                <TextInput
                                    id="price_yearly"
                                    type="number"
                                    step="0.01"
                                    name="price_yearly"
                                    value={data.price_yearly}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('price_yearly', e.target.value)}
                                />
                                <InputError message={errors.price_yearly} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="trial_days" value="Trial Period (Days)" />
                                <TextInput
                                    id="trial_days"
                                    type="number"
                                    name="trial_days"
                                    value={data.trial_days}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('trial_days', e.target.value)}
                                />
                                <InputError message={errors.trial_days} className="mt-2" />
                            </div>

                            <div className="col-span-2">
                                <InputLabel htmlFor="features" value="Features (One per line)" />
                                <textarea
                                    id="features"
                                    name="features"
                                    value={data.features}
                                    className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
                                    rows="5"
                                    placeholder="Menu Management&#10;Basic POS&#10;Daily Reports"
                                    onChange={(e) => setData('features', e.target.value)}
                                />
                                <InputError message={errors.features} className="mt-2" />
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Plan is Active (Available for subscription)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end border-t pt-6">
                            <PrimaryButton disabled={processing} className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {isEdit ? 'Update Plan' : 'Save Plan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
