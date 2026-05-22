import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';

export default function Index({ users }) {
    const { delete: destroy } = useForm();
    const { auth } = usePage().props;

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('superadmin.users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Global Users" />

            <div className="flex flex-col space-y-8 w-full pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Manage Global Users</h1>
                        <p className="mt-1 text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center">
                            <Users className="w-4 h-4 mr-2 text-brand-500" />
                            All System Users
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('superadmin.users.create')}
                            className="bg-brand-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all flex items-center justify-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New User</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-white/40">
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Cafe / Tenant</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/40 transition-colors group">
                                        <td className="py-4 px-6 text-sm font-black text-gray-900">{user.name}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-500">{user.email}</td>
                                        <td className="py-4 px-6 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'admin' ? 'bg-emerald-100 text-emerald-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-700">
                                            {user.tenant ? <span title={`Tenant ID: ${user.tenant.id}`}>{user.tenant.name} <span className="text-gray-400 text-xs ml-1">(ID: {user.tenant.id})</span></span> : <span className="text-gray-400 text-xs uppercase">Global (No Tenant)</span>}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={route('superadmin.users.edit', user.id)}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors shadow-sm"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                {user.id !== auth.user.id && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500 font-bold">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
