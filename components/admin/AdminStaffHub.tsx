
import React from 'react';
import { StaffApplication, StaffJobPost } from '../../types';

interface AdminStaffHubProps {
    applications: StaffApplication[];
    onDeleteApp: (id: number) => void;
    onPostApp: (app: StaffApplication) => void;
    onMarkRead: (id: number) => void;
}

const AdminStaffHub: React.FC<AdminStaffHubProps> = ({ applications, onDeleteApp, onPostApp, onMarkRead }) => {
    
    const handleContact = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const handleMessage = (phone: string, name: string) => {
        const text = encodeURIComponent(`Hello ${name}, we saw your application on BaBu SAHAB Staff Hub...`);
        window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
    };

    const sortedApps = [...applications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Applicant Inbox</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manage new staff joining the network</p>
                    </div>
                    <div className="bg-lemon/10 px-4 py-2 rounded-full border border-lemon/20">
                        <span className="text-lemon font-black text-xs uppercase tracking-widest">{applications.length} TOTAL</span>
                    </div>
                </div>

                {sortedApps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedApps.map(app => (
                            <div key={app.id} className="bg-black p-5 rounded-2xl border border-gray-800 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                                {!app.isRead && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <span className="flex h-2 w-2 rounded-full bg-lemon animate-pulse"></span>
                                    </div>
                                )}
                                
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[9px] font-black text-lemon uppercase tracking-[0.2em]">{app.category}</span>
                                            <h4 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mt-1">{app.staffName}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">{app.location} • {new Date(app.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800 mb-6">
                                        <p className="text-gray-400 text-[11px] leading-relaxed italic">"{app.cvDetails}"</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleContact(app.phone)}
                                        className="bg-gray-800 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        Contact
                                    </button>
                                    <button 
                                        onClick={() => onPostApp(app)}
                                        className="bg-lemon text-black font-black py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-lemon-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-lemon/10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Post
                                    </button>
                                    <button 
                                        onClick={() => handleMessage(app.phone, app.staffName)}
                                        className="bg-blue-600/10 text-blue-400 border border-blue-600/30 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        Message
                                    </button>
                                    <button 
                                        onClick={() => onDeleteApp(app.id)}
                                        className="bg-red-600/10 text-red-500 border border-red-600/30 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-gray-800 rounded-3xl">
                        <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Your inbox is currently empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStaffHub;
