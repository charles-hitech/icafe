import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        cafe_name: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
                <div className="text-center mb-8">
                    <ApplicationLogo className="h-16 w-16 mx-auto mb-4 text-gray-700" />
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Join us and start your journey</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="cafe_name" value="Business/Cafe Name" className="text-sm font-medium text-gray-700" />

                        <TextInput
                            id="cafe_name"
                            name="cafe_name"
                            value={data.cafe_name}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            autoComplete="organization"
                            isFocused={true}
                            onChange={(e) => setData('cafe_name', e.target.value)}
                            placeholder="Enter your cafe name"
                            required
                        />

                        <InputError message={errors.cafe_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="name" value="Your Full Name" className="text-sm font-medium text-gray-700" />

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            autoComplete="name"
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />

                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter your email address"
                            required
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-700" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Create a strong password"
                            required
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
                            className="text-sm font-medium text-gray-700"
                        />

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="Confirm your password"
                            required
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-600">
                                Already have an account?
                            </span>
                            <Link
                                href={route('login')}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>

                        <PrimaryButton 
                            className="w-full justify-center py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200" 
                            disabled={processing}
                        >
                            {processing ? 'Creating account...' : 'Create Account'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
