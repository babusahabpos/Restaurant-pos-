
import React, { useState } from 'react';
import { StaffJobPost, RestaurantJobPost } from '../../types';

interface AdminStaffHubProps {
    jobPosts: StaffJobPost[];
    onApprove: (id: number) => void;
    onDelete: (id: number) => void;
    onMessage: (phone: string, text: string) => void;
    onCreateRestaurantJob: (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => void;
    activeRestaurantJobs: RestaurantJobPost[];
    onDeleteRestaurantJob: (id: number) => void;
}

const AdminStaffHub: React.FC<AdminStaffHubProps> = ({ jobPosts, onApprove, onDelete, onMessage, onCreateRestaurantJob, activeRestaurantJobs, onDeleteRestaurantJob }) => {
    const [view, setView] = useState<'pending' | 'active' | 'restaurants'>('pending');
    const [msgModal, setMsgModal] = useState<{ name: string; phone: string } | null>(null);
    const [msgText, setMsgText] = useState('');
    
    const [jobForm, setJobForm] = useState({
        restaurantName: '', address: '', category: '', salary: '', phone: ''
    });

    const pendingPosts = jobPosts.filter(p => p.status === 'Pending');
    const approvedPosts = jobPosts.filter(p => p.status === 'Approved');

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateRestaurantJob(jobForm);
        setJobForm({ restaurantName: '', address: '', category: '', salary: '', phone: '' });
        alert("Vacancy Published!");
    };

    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (msgModal && msgText.trim()) {
            onMessage(msgModal.phone, msgText);
            setMsgText('');
            setMsgModal(null);
            alert("Message Sent!");
        }
    };

    return (
        <div className="space-y-6">
            {msgModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[120] p-4">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-white tracking-widest">Message {msgModal.name}</h3>
                            <button onClick={() => setMsgModal(null)} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSendMsg} className="space-y-4">
                            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type message to worker..." className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 outline-none font-bold" rows={4} required />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-lemon/10">Send Message</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800 overflow-x-auto no-scrollbar">
                <button onClick={() => setView('pending')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === 'pending' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Pending CVs ({pendingPosts.length})</button>
                <button onClick={() => setView('active')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === 'active' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Live Workers ({approvedPosts.length})</button>
                <button onClick={() => setView('restaurants')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === 'restaurants' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Post Vacancy</button>
            </div>

            {view === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingPosts.length > 0 ? pendingPosts.map(post => (
                        <div key={post.id} className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                            <span className="text-[8px] font-black bg-lemon text-black px-2 py-0.5 rounded-full uppercase tracking-widest">{post.category}</span>
                            <h4 className="text-xl font-black text-white uppercase mt-1 tracking-tighter">{post.staffName}</h4>
                            <p className="text-[10px] text-gray-500 font-bold mt-1">{post.location} • {post.phone}</p>
                            <p className="text-gray-400 text-xs mt-4 italic">"{post.cvDetails}"</p>
                            <div className="grid grid-cols-2 gap-2 mt-6">
                                <button onClick={() => onApprove(post.id)} className="bg-green-600 text-white font-black py-2.5 rounded-xl text-[9px] uppercase">Approve</button>
                                <button onClick={() => onDelete(post.id)} className="bg-gray-800 text-red-500 font-black py-2.5 rounded-xl text-[9px] uppercase">Reject</button>
                                <button onClick={() => setMsgModal({ name: post.staffName, phone: post.phone })} className="col-span-2 bg-gray-800 text-white font-black py-2.5 rounded-xl text-[9px] uppercase border border-white/5">Message Worker</button>
                            </div>
                        </div>
                    )) : <p className="col-span-full text-center py-20 text-gray-600 font-black uppercase text-xs tracking-widest">No pending profiles</p>}
                </div>
            )}

            {view === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedPosts.length > 0 ? approvedPosts.map(post => (
                        <div key={post.id} className="bg-gray-900 border border-gray-800 p-5 rounded-3xl flex justify-between items-center group">
                            <div>
                                <h4 className="text-white font-black uppercase">{post.staffName}</h4>
                                <p className="text-lemon text-[10px] font-bold uppercase">{post.category} • {post.location}</p>
                                <div className="flex gap-4 mt-2">
                                    <button onClick={() => setMsgModal({ name: post.staffName, phone: post.phone })} className="text-[8px] font-black uppercase text-blue-400 hover:underline">Message</button>
                                    <a href={`tel:${post.phone}`} className="text-[8px] font-black uppercase text-green-400 hover:underline">Call</a>
                                </div>
                            </div>
                            <button onClick={() => onDelete(post.id)} className="bg-red-600/10 text-red-500 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    )) : <p className="col-span-full text-center py-20 text-gray-600 font-black uppercase text-xs tracking-widest">No active profiles</p>}
                </div>
            )}

            {view === 'restaurants' && (
                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 space-y-8">
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Publish New Restaurant Vacancy</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Restaurant Name" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.restaurantName} onChange={e => setJobForm({...jobForm, restaurantName: e.target.value})} required />
                            <input placeholder="Role" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.category} onChange={e => setJobForm({...jobForm, category: e.target.value})} required />
                        </div>
                        <input placeholder="Address" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.address} onChange={e => setJobForm({...jobForm, address: e.target.value})} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Salary" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} required />
                            <input placeholder="Phone" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.phone} onChange={e => setJobForm({...jobForm, phone: e.target.value})} required />
                        </div>
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20">Publish Vacancy</button>
                    </form>

                    <div className="border-t border-gray-800 pt-8">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Active Vacancies ({activeRestaurantJobs.length})</h3>
                        <div className="space-y-2">
                            {activeRestaurantJobs.map(job => (
                                <div key={job.id} className="bg-black border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <h4 className="text-white font-bold uppercase text-xs">{job.restaurantName}</h4>
                                        <p className="text-lemon text-[8px] font-black uppercase">{job.category} • ₹{job.salary}</p>
                                    </div>
                                    <button onClick={() => onDeleteRestaurantJob(job.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaffHub;
