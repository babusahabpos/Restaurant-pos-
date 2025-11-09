import React from 'react';
import { RegisteredUser, UserStatus } from '../../types';

const AdminDashboard: React.FC<{ 
    users: RegisteredUser[];
    onApproveReject: (userId: number, decision: 'approve' | 'reject') => void;
}> = ({ users, onApproveReject }) => {

    const pendingUsers = users.filter(u => u.status === UserStatus.Pending);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Pending User Approvals ({pendingUsers.length})</h3>
                {pendingUsers.length > 0 ? (
                    <div className="space-y-4">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-800 rounded-lg">
                                <div>
                                    <p className="font-semibold text-white">{user.restaurantName}</p>
                                    <p className="text-sm text-gray-400">{user.name} - {user.email}</p>
                                </div>
                                <div className="flex gap-3 mt-3 md:mt-0">
                                    <button onClick={() => onApproveReject(user.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Approve</button>
                                    <button onClick={() => onApproveReject(user.id, 'reject')} className="bg-lemon hover:bg-lemon-dark text-black font-bold py-2 px-4 rounded">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No pending approvals.</p>
                )}
            </div>
             <div className="p-6 bg-gray-900 rounded-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">System Overview</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Approved Users</p>
                        <p className="text-3xl font-bold text-white">{users.filter(u => u.status === UserStatus.Approved).length}</p>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Blocked Users</p>
                        <p className="text-3xl font-bold text-white">{users.filter(u => u.status === UserStatus.Blocked).length}</p>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-white">{users.length}</p>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default AdminDashboard;