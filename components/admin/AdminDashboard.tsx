
import React from 'react';
import { RegisteredUser, UserStatus, StaffUser, SupportTicket, StaffRequirementRequest, StaffApplication, StaffJobPost } from '../../types';

interface AdminDashboardProps {
    users: RegisteredUser[];
    staffUsers: StaffUser[];
    tickets: SupportTicket[];
    staffRequests: StaffRequirementRequest[];
    staffApplications: StaffApplication[];
    jobPosts: StaffJobPost[];
    onApproveReject: (userId: number, decision: 'approve' | 'reject') => void;
    onApproveJobPost?: (id: number) => void;
    onDeleteJobPost?: (id: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, staffUsers = [], tickets, staffRequests, staffApplications, jobPosts, onApproveReject, onApproveJobPost, onDeleteJobPost }) => {

    const pendingUsers = users.filter(u => u.status === UserStatus.Pending);
    const pendingJobPosts = jobPosts.filter(p => p.status === 'Pending');

    const activityItems = [
        ...pendingUsers.map(u => ({ type: 'Restaurant', title: u.restaurantName, subtitle: `Owner: ${u.name}`, time: 'Awaiting Approval', status: 'priority' })),
        ...pendingJobPosts.map(p => ({ type: 'Staff CV', title: p.staffName, subtitle: `Role: ${p.category}`, time: 'Awaiting Approval', status: 'priority' })),
        ...tickets.filter(t => t.status === 'Open').map(t => ({ type: 'Ticket', title: t.subject, subtitle: `From: ${t.userName}`, time: 'Open', status: 'normal' })),
        ...staffRequests.filter(r => !r.isRead).map(r => ({ type: 'Staff Req', title: r.requirement, subtitle: r.restaurantName, time: 'New Request', status: 'normal' })),
    ].sort((a, b) => b.type.localeCompare(a.type));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Clients</p>
                    <p className="text-3xl font-black text-white mt-1">{users.filter(u => u.status === UserStatus.Approved).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Live Workers</p>
                    <p className="text-3xl font-black text-lemon mt-1">{jobPosts.filter(p => p.status === 'Approved').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Open Tickets</p>
                    <p className="text-3xl font-black text-blue-500 mt-1">{tickets.filter(t => t.status === 'Open').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">System Alerts</p>
                    <p className="text-3xl font-black text-red-500 mt-1">{activityItems.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {/* Approval Queue Section */}
                <div className="p-6 bg-gray-900 rounded-[2.5rem] border border-gray-800 flex flex-col min-h-[400px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        Approval Queue
                        {([...pendingUsers, ...pendingJobPosts].length > 0) && (
                            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{[...pendingUsers, ...pendingJobPosts].length}</span>
                        )}
                    </h3>
                    <div className="space-y-4">
                        {[...pendingUsers, ...pendingJobPosts].length > 0 ? (
                            <>
                                {pendingUsers.map(user => (
                                    <div key={user.id} className="p-5 bg-black border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-lemon shadow-lg">
                                        <div className="text-center sm:text-left flex-1">
                                            <span className="text-[8px] bg-lemon text-black font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Restaurant Owner</span>
                                            <p className="font-black text-white uppercase text-sm mt-1 leading-tight">{user.restaurantName}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{user.name} • {user.phone}</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={() => onApproveReject(user.id, 'approve')} className="flex-1 sm:flex-none bg-lemon text-black font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase">Approve</button>
                                            <button onClick={() => onApproveReject(user.id, 'reject')} className="flex-1 sm:flex-none bg-gray-800 text-white font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase">Reject</button>
                                        </div>
                                    </div>
                                ))}
                                {pendingJobPosts.map(post => (
                                    <div key={post.id} className="p-5 bg-black border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-green-500 shadow-lg">
                                        <div className="text-center sm:text-left flex-1">
                                            <span className="text-[8px] bg-green-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Staff Job Request</span>
                                            <p className="font-black text-white uppercase text-sm mt-1 leading-tight">{post.staffName}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{post.category} • {post.location}</p>
                                            <p className="text-[9px] text-gray-600 mt-2 line-clamp-1 italic">"{post.cvDetails}"</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button 
                                                onClick={() => onApproveJobPost && onApproveJobPost(post.id)} 
                                                className="flex-1 sm:flex-none bg-green-600 text-white font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase shadow-lg shadow-green-900/20"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => onDeleteJobPost && onDeleteJobPost(post.id)} 
                                                className="flex-1 sm:flex-none bg-gray-800 text-white font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                <p className="text-gray-500 font-black uppercase text-xs tracking-widest text-center">Queue is clear</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Activity Section */}
                <div className="p-6 bg-gray-900 rounded-[2.5rem] border border-gray-800 flex flex-col min-h-[400px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight">System Feed</h3>
                    <div className="space-y-3 overflow-y-auto no-scrollbar pr-2">
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
                            <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                                <p className="text-gray-500 font-black uppercase text-xs tracking-widest text-center">Feed is empty</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
