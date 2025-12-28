
import React from 'react';
import { StaffUser } from '../../types';

interface AdminStaffManagementProps {
    users: StaffUser[];
    onBlock: (id: number, block: boolean) => void;
    onDelete: (id: number) => void;
    onMessage: (id: number) => void;
    onApproveSubscription: (userId: number, approve: boolean) => void;
}

const AdminStaffManagement: React.FC<AdminStaffManagementProps> = ({ users, onBlock, onDelete, onMessage, onApproveSubscription }) => {
    return (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Worker Registry ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/50 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-800">
                            <th className="px-6 py-4">Worker Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Subscription Plan</th>
                            <th className="px-6 py-4">System Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-white uppercase">{user.name}</p>
                                    <p className="text-[8px] text-gray-600 font-black uppercase">Member Since: {new Date(user.registeredAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-mono text-lemon">{user.phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {user.subscriptionStatus === 'pending' ? (
                                        <div className="flex gap-1">
                                            <button onClick={() => onApproveSubscription(user.id, true)} className="bg-green-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg uppercase shadow-lg shadow-green-900/20 active:scale-95 transition-transform">Approve Pay</button>
                                            <button onClick={() => onApproveSubscription(user.id, false)} className="bg-red-600/10 text-red-500 border border-red-600/30 text-[8px] font-black px-3 py-1.5 rounded-lg uppercase">Reject</button>
                                        </div>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${user.subscriptionStatus === 'active' ? 'bg-green-600/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                                            {user.subscriptionStatus === 'active' ? 'Premium Member' : 'Free Access'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     {user.isBlocked ? <span className="bg-red-600/10 text-red-500 px-2 py-1 rounded text-[9px] font-black uppercase">Blocked</span> : <span className="text-green-500 text-[9px] font-black uppercase tracking-widest">Active</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => onMessage(user.id)} className="text-[10px] font-black text-blue-500 uppercase hover:underline">Chat</button>
                                        <button onClick={() => onBlock(user.id, !user.isBlocked)} className={`text-[10px] font-black uppercase hover:underline ${user.isBlocked ? 'text-green-500' : 'text-lemon'}`}>
                                            {user.isBlocked ? 'Unlock' : 'Lock'}
                                        </button>
                                        <button onClick={() => onDelete(user.id)} className="text-[10px] font-black text-red-500 uppercase hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="py-20 text-center text-gray-600 font-black uppercase text-xs tracking-widest opacity-50">No workers registered in the hub yet</div>
                )}
            </div>
        </div>
    );
};

export default AdminStaffManagement;
