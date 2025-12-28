
import React from 'react';
import { StaffUser } from '../../types';

interface AdminStaffManagementProps {
    users: StaffUser[];
    onBlock: (id: number, block: boolean) => void;
    onDelete: (id: number) => void;
    onMessage: (id: number) => void;
}

const AdminStaffManagement: React.FC<AdminStaffManagementProps> = ({ users, onBlock, onDelete, onMessage }) => {
    return (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Registered Workers ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/50 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-800">
                            <th className="px-6 py-4">Worker Name</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Registered</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-white uppercase">{user.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-mono text-lemon">{user.phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${user.isSubscribed ? 'bg-green-600/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                                            {user.isSubscribed ? 'Paid Member' : 'Free User'}
                                        </span>
                                        {user.isBlocked && <span className="bg-red-600/10 text-red-500 px-2 py-1 rounded text-[9px] font-black uppercase">Blocked</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase">
                                    {new Date(user.registeredAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onMessage(user.id)} className="text-[10px] font-black text-blue-500 uppercase hover:underline">Message</button>
                                        <button onClick={() => onBlock(user.id, !user.isBlocked)} className="text-[10px] font-black text-lemon uppercase hover:underline">
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                        <button onClick={() => onDelete(user.id)} className="text-[10px] font-black text-red-500 uppercase hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="py-20 text-center text-gray-600 font-black uppercase text-xs tracking-widest">No workers registered yet</div>
                )}
            </div>
        </div>
    );
};

export default AdminStaffManagement;
