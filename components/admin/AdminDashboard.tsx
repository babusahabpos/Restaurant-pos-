
import React from 'react';
import { RegisteredUser, UserStatus, StaffUser, SupportTicket, StaffRequirementRequest, StaffApplication } from '../../types';

interface AdminDashboardProps {
    users: RegisteredUser[];
    staffUsers: StaffUser[];
    tickets: SupportTicket[];
    staffRequests: StaffRequirementRequest[];
    staffApplications: StaffApplication[];
    onApproveReject: (userId: number, decision: 'approve' | 'reject') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, staffUsers, tickets, staffRequests, staffApplications, onApproveReject }) => {

    const pendingUsers = users.filter(u => u.status === UserStatus.Pending);
    const pendingStaff = staffUsers.filter(u => u.status === 'Pending');

    // Aggregate activity feed from all channels
    const activityItems = [
        ...pendingUsers.map(u => ({ type: 'Restaurant', title: u.restaurantName, subtitle: `Owner: ${u.name}`, time: 'Awaiting Approval', status: 'priority' })),
        ...pendingStaff.map(u => ({ type: 'Worker Account', title: u.name, subtitle: `Phone: ${u.phone}`, time: 'Registration Request', status: 'priority' })),
        ...tickets.filter(t => t.status === 'Open').map(t => ({ type: 'Ticket', title: t.subject, subtitle: `From: ${t.userName}`, time: 'Open', status: 'normal' })),
        ...staffRequests.filter(r => !r.isRead).map(r => ({ type: 'Staff Req', title: r.requirement, subtitle: r.restaurantName, time: 'New Request', status: 'normal' })),
        ...staffApplications.filter(a => !a.isRead).map(a => ({ type: 'Worker Profile', title: a.staffName, subtitle: a.category, time: 'New Submission', status: 'normal' })),
    ].sort((a, b) => b.type.localeCompare(a.type));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Clients</p>
                    <p className="text-3xl font-black text-white mt-1">{users.filter(u => u.status === UserStatus.Approved).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Staff</p>
                    <p className="text-3xl font-black text-lemon mt-1">{staffUsers.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Open Tickets</p>
                    <p className="text-3xl font-black text-blue-500 mt-1">{tickets.filter(t => t.status === 'Open').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">System Alerts</p>
                    <p className="text-3xl font-black text-red-500 mt-1">{activityItems.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 flex flex-col h-[500px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight">Pending Registrations</h3>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                        {[...pendingUsers, ...pendingStaff].length > 0 ? (
                            <>
                                {pendingUsers.map(user => (
                                    <div key={user.id} className="p-4 bg-black border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-lemon">
                                        <div className="text-center sm:text-left">
                                            <span className="text-[8px] bg-lemon text-black font-black px-2 py-0.5 rounded-full uppercase">Restaurant</span>
                                            <p className="font-black text-white uppercase text-sm mt-1">{user.restaurantName}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{user.name} • {user.phone}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => onApproveReject(user.id, 'approve')} className="bg-lemon text-black font-black py-2 px-4 rounded-xl text-[10px] uppercase">Approve</button>
                                        </div>
                                    </div>
                                ))}
                                {pendingStaff.map(staff => (
                                    <div key={staff.id} className="p-4 bg-black border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-blue-500">
                                        <div className="text-center sm:text-left">
                                            <span className="text-[8px] bg-blue-500 text-white font-black px-2 py-0.5 rounded-full uppercase">Worker</span>
                                            <p className="font-black text-white uppercase text-sm mt-1">{staff.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{staff.phone}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-black uppercase italic">Go to Staff Management to approve</p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-30 grayscale">
                                <p className="text-gray-500 font-black uppercase text-xs tracking-widest text-center">No pending items</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 flex flex-col h-[500px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight">Unified Live Activity</h3>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                        {activityItems.length > 0 ? activityItems.map((item, idx) => (
                            <div key={idx} className="bg-black/50 p-4 rounded-2xl border border-gray-800 flex justify-between items-center group hover:border-lemon/30 transition-all cursor-default">
                                <div className="flex-1 min-w-0 pr-4">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.status === 'priority' ? 'bg-red-600 text-white' : 'bg-lemon/10 text-lemon'}`}>{item.type}</span>
                                    <p className="text-white font-bold uppercase text-xs mt-1 truncate">{item.title}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 truncate">{item.subtitle}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-[9px] font-black uppercase tracking-tighter ${item.status === 'priority' ? 'text-red-500 animate-pulse' : 'text-lemon'}`}>{item.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center opacity-30 grayscale">
                                <p className="text-gray-500 font-black uppercase text-xs tracking-widest text-center">System idle</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
