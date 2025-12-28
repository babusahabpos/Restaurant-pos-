
import React, { useState } from 'react';
import { StaffJobPost, StaffRequirementRequest, StaffApplication } from '../../types';

interface AdminStaffRequirementsProps {
    requests: StaffRequirementRequest[];
    applications: StaffApplication[];
    jobPosts: StaffJobPost[];
    onAddPost: (post: Omit<StaffJobPost, 'id' | 'timestamp'>) => void;
    onDeletePost: (id: number) => void;
    onMarkRead: (id: number) => void;
    onMarkAppRead: (id: number) => void;
}

const AdminStaffRequirements: React.FC<AdminStaffRequirementsProps> = ({ requests, applications, jobPosts, onAddPost, onDeletePost, onMarkRead, onMarkAppRead }) => {
    const [view, setView] = useState<'requests' | 'applications' | 'create'>('requests');
    const [formData, setFormData] = useState({
        staffName: '',
        category: '',
        phone: '',
        location: '',
        cvDetails: ''
    });

    const staffApplyUrl = `${window.location.origin}${window.location.pathname}#staff-apply`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(staffApplyUrl);
        alert("Staff Application Link Copied!");
    };

    const handleApproveApp = (app: StaffApplication) => {
        onAddPost({
            staffName: app.staffName,
            category: app.category,
            phone: app.phone,
            location: app.location,
            cvDetails: app.cvDetails
        });
        onMarkAppRead(app.id);
        alert(`Approved ${app.staffName} and posted to Staff Hub!`);
        setView('requests');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddPost(formData);
        setFormData({ staffName: '', category: '', phone: '', location: '', cvDetails: '' });
        setView('requests');
    };

    const unreadApps = applications.filter(a => !a.isRead).length;
    const unreadReqs = requests.filter(r => !r.isRead).length;

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-white font-black text-xs uppercase tracking-widest">Public Application Link</h3>
                    <p className="text-[10px] text-gray-500 font-bold">Share this link with staff to let them upload their CV</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input readOnly value={staffApplyUrl} className="bg-black text-[10px] text-lemon p-2 rounded-lg border border-gray-800 flex-1 sm:w-64" />
                    <button onClick={handleCopyLink} className="bg-lemon text-black font-black px-4 py-2 rounded-lg text-[10px] uppercase">Copy</button>
                </div>
            </div>

            <div className="flex gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setView('requests')}
                    className={`flex-1 min-w-[140px] py-3 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${view === 'requests' ? 'bg-lemon text-black' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    User Requests 
                    {unreadReqs > 0 && <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{unreadReqs}</span>}
                </button>
                <button 
                    onClick={() => setView('applications')}
                    className={`flex-1 min-w-[140px] py-3 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${view === 'applications' ? 'bg-lemon text-black' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Staff Apps
                    {unreadApps > 0 && <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">{unreadApps}</span>}
                </button>
                <button 
                    onClick={() => setView('create')}
                    className={`flex-1 min-w-[140px] py-3 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'create' ? 'bg-lemon text-black' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Post Manual
                </button>
            </div>

            {view === 'requests' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">User Requirements Inbox</h3>
                    {requests.length > 0 ? (
                        requests.slice().reverse().map(req => (
                            <div key={req.id} className={`p-4 rounded-xl border ${req.isRead ? 'bg-gray-900 border-gray-800' : 'bg-lemon/5 border-lemon/30'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-lemon font-bold uppercase text-[10px]">{req.restaurantName}</p>
                                        <p className="text-[9px] text-gray-500 uppercase">{new Date(req.timestamp).toLocaleString()}</p>
                                    </div>
                                    {!req.isRead && <button onClick={() => onMarkRead(req.id)} className="text-[8px] bg-lemon text-black px-2 py-1 rounded font-black uppercase">Mark Read</button>}
                                </div>
                                <p className="text-white font-bold text-sm mb-1">{req.requirement}</p>
                                <p className="text-lemon font-black text-xs">Salary: ₹{req.salary}</p>
                            </div>
                        ))
                    ) : <p className="text-center py-10 text-gray-600 italic">No incoming requests from restaurant owners</p>}
                </div>
            )}

            {view === 'applications' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Staff Submissions (CVs)</h3>
                    {applications.length > 0 ? (
                        applications.slice().reverse().map(app => (
                            <div key={app.id} className={`p-5 rounded-2xl border ${app.isRead ? 'bg-gray-900 border-gray-800 opacity-60' : 'bg-black border-lemon/40 shadow-xl'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[9px] font-black text-lemon uppercase tracking-widest">{app.category}</span>
                                        <h4 className="text-xl font-black text-white uppercase">{app.staffName}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{app.location} • {new Date(app.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                         <button onClick={() => onMarkAppRead(app.id)} className="text-gray-500 hover:text-white p-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm mb-6 p-3 bg-white/5 rounded-xl border border-white/5">{app.cvDetails}</p>
                                <div className="flex gap-3">
                                    <a href={`tel:${app.phone}`} className="flex-1 bg-gray-800 text-white font-black py-3 rounded-xl text-center text-[10px] uppercase">Call Staff</a>
                                    {!app.isRead && (
                                        <button onClick={() => handleApproveApp(app)} className="flex-[2] bg-lemon text-black font-black py-3 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/10">Approve & Post to Staff Hub</button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : <p className="text-center py-10 text-gray-600 italic">No applications received yet</p>}
                </div>
            )}

            {view === 'create' && (
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white uppercase mb-6 tracking-tight text-center">Post Available Staff</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <input 
                                placeholder="Staff Name" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.staffName}
                                onChange={e => setFormData({...formData, staffName: e.target.value})}
                                required
                            />
                            <input 
                                placeholder="Staff Category (Ex. Chef, Waiter)" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                required
                            />
                            <input 
                                placeholder="Phone Number" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                            <input 
                                placeholder="Location" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                placeholder="CV Summary / Experience Details" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none h-[155px]"
                                value={formData.cvDetails}
                                onChange={e => setFormData({...formData, cvDetails: e.target.value})}
                                required
                            />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-xs">Publish Post</button>
                        </div>
                    </form>
                </div>
            )}
            
            <hr className="border-gray-800 my-8" />
            <h3 className="text-white font-black uppercase text-xs tracking-widest">Currently Live in Hub ({jobPosts.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobPosts.map(post => (
                    <div key={post.id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700">
                        <div>
                            <p className="text-white font-bold">{post.staffName}</p>
                            <p className="text-[10px] text-lemon font-bold uppercase">{post.category}</p>
                        </div>
                        <button onClick={() => onDeletePost(post.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminStaffRequirements;
