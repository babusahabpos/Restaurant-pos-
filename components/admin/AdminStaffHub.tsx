
import React, { useState } from 'react';
import { StaffJobPost, RestaurantJobPost, StaffRequirementRequest } from '../../types';

interface AdminStaffHubProps {
    jobPosts: StaffJobPost[];
    onApprove: (id: number) => void;
    onDelete: (id: number) => void;
    onMessage: (phone: string, text: string) => void;
    onCreateRestaurantJob: (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => void;
    activeRestaurantJobs: RestaurantJobPost[];
    onDeleteRestaurantJob: (id: number) => void;
    staffRequests: StaffRequirementRequest[];
    onMarkRequestRead: (id: number) => void;
}

const AdminStaffHub: React.FC<AdminStaffHubProps> = ({ 
    jobPosts, onApprove, onDelete, onMessage, 
    onCreateRestaurantJob, activeRestaurantJobs, onDeleteRestaurantJob,
    staffRequests, onMarkRequestRead 
}) => {
    const [view, setView] = useState<'staff' | 'requests' | 'create' | 'active'>('staff');
    const [jobForm, setJobForm] = useState({ restaurantName: '', address: '', category: '', salary: '', phone: '' });

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateRestaurantJob(jobForm);
        setJobForm({ restaurantName: '', address: '', category: '', salary: '', phone: '' });
        alert("Vacancy Published globally!");
        setView('active');
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-1.5 bg-gray-900 p-1.5 rounded-2xl border border-gray-800 overflow-x-auto no-scrollbar">
                <button onClick={() => setView('staff')} className={`flex-1 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${view === 'staff' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Worker Profiles ({jobPosts.length})</button>
                <button onClick={() => setView('requests')} className={`flex-1 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${view === 'requests' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Owner Requests ({staffRequests.filter(r => !r.isRead).length})</button>
                <button onClick={() => setView('create')} className={`flex-1 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${view === 'create' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Post Vacancy</button>
                <button onClick={() => setView('active')} className={`flex-1 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${view === 'active' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Live Feed ({activeRestaurantJobs.length})</button>
            </div>

            {view === 'staff' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobPosts.map(post => (
                        <div key={post.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] flex justify-between items-center group">
                            <div className="flex-1 pr-4">
                                <span className="text-[8px] font-black bg-lemon text-black px-2 py-0.5 rounded-full uppercase tracking-widest">{post.category}</span>
                                <h4 className="text-white font-black uppercase text-lg mt-1">{post.staffName}</h4>
                                <p className="text-gray-500 text-[10px] font-bold uppercase">{post.location} • {post.phone}</p>
                                <div className="flex gap-4 mt-3">
                                    {post.status !== 'Approved' && <button onClick={() => onApprove(post.id)} className="text-[9px] font-black uppercase text-lemon hover:underline">Approve</button>}
                                    <button onClick={() => onMessage(post.phone, 'Admin regarding profile: ')} className="text-[9px] font-black uppercase text-blue-400 hover:underline">Message</button>
                                </div>
                            </div>
                            <button onClick={() => onDelete(post.id)} className="text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        </div>
                    ))}
                </div>
            )}

            {view === 'requests' && (
                <div className="space-y-4">
                    {staffRequests.length > 0 ? staffRequests.slice().reverse().map(req => (
                        <div key={req.id} className={`p-5 rounded-[2rem] border transition-all ${req.isRead ? 'bg-gray-900 border-gray-800' : 'bg-lemon/5 border-lemon/30 animate-pulse-slow'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-lemon font-black uppercase text-xs tracking-widest">{req.restaurantName}</p>
                                    <p className="text-[9px] text-gray-500 uppercase font-black">{new Date(req.timestamp).toLocaleString()}</p>
                                </div>
                                {!req.isRead && <button onClick={() => onMarkRequestRead(req.id)} className="text-[8px] bg-lemon text-black px-2.5 py-1 rounded-full font-black uppercase">Mark Seen</button>}
                            </div>
                            <p className="text-white font-bold text-base">"Need: {req.requirement}"</p>
                            <p className="text-gray-400 font-black text-[10px] mt-2 uppercase">Budgeted Salary: ₹{req.salary}</p>
                        </div>
                    )) : <p className="text-center py-20 text-gray-600 font-black uppercase text-[10px]">No owner requests yet</p>}
                </div>
            )}

            {view === 'create' && (
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Official Job Broadcast</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Restaurant Name" className="bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" value={jobForm.restaurantName} onChange={e => setJobForm({...jobForm, restaurantName: e.target.value})} required />
                            <input placeholder="Category (Chef/Waiter)" className="bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" value={jobForm.category} onChange={e => setJobForm({...jobForm, category: e.target.value})} required />
                        </div>
                        <input placeholder="Address" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" value={jobForm.address} onChange={e => setJobForm({...jobForm, address: e.target.value})} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Salary" className="bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} required />
                            <input placeholder="Phone" className="bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" value={jobForm.phone} onChange={e => setJobForm({...jobForm, phone: e.target.value})} required />
                        </div>
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 active:scale-95 transition-transform">Publish to all User Terminals</button>
                    </form>
                </div>
            )}

            {view === 'active' && (
                <div className="space-y-3">
                    {activeRestaurantJobs.map(job => (
                        <div key={job.id} className="bg-black border border-gray-800 p-5 rounded-[2rem] flex justify-between items-center hover:border-lemon/20 transition-all">
                            <div>
                                <h4 className="text-white font-black uppercase text-sm">{job.restaurantName} <span className="text-[7px] bg-green-900 text-green-300 px-1.5 py-0.5 rounded ml-2">LIVE</span></h4>
                                <p className="text-lemon text-[10px] font-black uppercase mt-1">{job.category} • ₹{job.salary}</p>
                            </div>
                            <button onClick={() => onDeleteRestaurantJob(job.id)} className="text-red-500 hover:bg-red-500/10 p-3 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStaffHub;
