
import React, { useState } from 'react';
import { RegisteredUser, UserStatus, MenuItem } from '../../types';

const UserManagement: React.FC<{
    users: RegisteredUser[];
    onBlockUser: (userId: number, shouldBlock: boolean) => void;
    onSendMessage: (userId: number | 'all', message: string) => void;
    onPasswordChange: (userId: number, newPass: string) => void;
    onUpdateSubscription: (userId: number, newDate: string) => void;
    onUpdateMenu: (userId: number, menu: MenuItem[]) => void;
    onDeleteUser: (userId: number) => void;
}> = ({ users, onBlockUser, onSendMessage, onPasswordChange, onUpdateSubscription, onUpdateMenu, onDeleteUser }) => {
    
    const getStatusChip = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Approved: return <span className="bg-green-800 text-green-300 text-[10px] px-2 py-0.5 rounded-full">Approved</span>;
            case UserStatus.Pending: return <span className="bg-lemon/20 text-lemon text-[10px] px-2 py-0.5 rounded-full">Pending</span>;
            case UserStatus.Rejected: return <span className="bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">Rejected</span>;
            case UserStatus.Blocked: return <span className="bg-red-900/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full">Blocked</span>;
            case UserStatus.Deleted: return <span className="bg-red-900 text-red-300 text-[10px] px-2 py-0.5 rounded-full">Deleted</span>;
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-[2rem] border border-gray-800 shadow-xl overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Restaurant Management</h3>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-gray-500 uppercase font-black bg-black/40 border-b border-gray-800">
                        <tr>
                            <th className="px-6 py-4">Business & Owner</th>
                            <th className="px-6 py-4">Contact Details</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-black text-white uppercase text-sm">{user.restaurantName}</p>
                                    <p className="text-[10px] text-gray-500 uppercase mt-0.5">Owner: {user.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-lemon font-bold text-xs">{user.phone}</p>
                                    <p className="text-[10px] text-gray-400 lowercase">{user.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-mono text-[10px] text-white bg-gray-800 px-2 py-1 rounded-md inline-block">{user.subscriptionEndDate}</p>
                                </td>
                                <td className="px-6 py-4">{getStatusChip(user.status)}</td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    {user.status !== UserStatus.Deleted && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onBlockUser(user.id, user.status !== UserStatus.Blocked)} className="text-[9px] font-black uppercase text-lemon hover:underline">{user.status === UserStatus.Blocked ? 'Unblock' : 'Block'}</button>
                                            <button onClick={() => onDeleteUser(user.id)} className="text-[9px] font-black uppercase text-red-500 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
