
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
    const [view, setView] = useState<'staff' | 'create' | 'active'>('staff');
    const [msgModal, setMsgModal] = useState<{ name: string; phone: string } | null>(null);
    const [msgText, setMsgText] = useState('');
    
    const [jobForm, setJobForm] = useState({
        restaurantName: '', address: '', category: '', salary: '', phone: ''
    });

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateRestaurantJob(jobForm);
        setJobForm({ restaurantName: '', address: '', category: '', salary: '', phone: '' });
        alert("Vacancy Published to all Users!");
        setView('active');
    };

    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (msgModal && msgText.trim()) {
            onMessage(msgModal.phone, msgText);
            setMsgText('');
            setMsgModal(null);
            alert("Message Sent to Worker!");
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
                <button onClick={() => setView('staff')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === 'staff' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Worker Profiles ({jobPosts.length})</button>
                <button onClick={() => setView('create')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === 'create' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Post Vacancy</button>
                <button onClick={() => setView('active')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === 'active' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Live Jobs ({activeRestaurantJobs.length})</button>
            </div>

            {view === 'staff' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobPosts.length > 0 ? jobPosts.map(post => (
                        <div key={post.id} className="bg-gray-900 border border-gray-800 p-5 rounded-3xl flex justify-between items-center group">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[8px] font-black bg-lemon text-black px-2 py-0.5 rounded-full uppercase tracking-widest">{post.category}</span>
                                     <span className={`text-[8px] font-black uppercase ${post.status === 'Approved' ? 'text-green-500' : 'text-yellow-500'}`}>{post.status}</span>
                                </div>
                                <h4 className="text-white font-black uppercase text-lg mt-1">{post.staffName}</h4>
                                <p className="text-gray-500 text-[10px] font-bold uppercase">{post.location} • {post.phone}</p>
                                <div className="flex gap-4 mt-3">
                                    {post.status !== 'Approved' && <button onClick={() => onApprove(post.id)} className="text-[9px] font-black uppercase text-lemon hover:underline">Approve</button>}
                                    <button onClick={() => setMsgModal({ name: post.staffName, phone: post.phone })} className="text-[9px] font-black uppercase text-blue-400 hover:underline">Message</button>
                                    <a href={`tel:${post.phone}`} className="text-[9px] font-black uppercase text-green-400 hover:underline">Call</a>
                                </div>
                            </div>
                            <button onClick={() => onDelete(post.id)} className="bg-red-600/10 text-red-500 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    )) : <p className="col-span-full text-center py-20 text-gray-600 font-black uppercase text-xs tracking-widest">No worker profiles posted yet</p>}
                </div>
            )}

            {view === 'create' && (
                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800">
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Global Vacancy Broadcast</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Restaurant Name" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.restaurantName} onChange={e => setJobForm({...jobForm, restaurantName: e.target.value})} required />
                            <input placeholder="Staff Role Needed" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.category} onChange={e => setJobForm({...jobForm, category: e.target.value})} required />
                        </div>
                        <input placeholder="Full Address" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.address} onChange={e => setJobForm({...jobForm, address: e.target.value})} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Salary Range" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} required />
                            <input placeholder="Contact Phone" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.phone} onChange={e => setJobForm({...jobForm, phone: e.target.value})} required />
                        </div>
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20">Publish Job to all Terminals</button>
                    </form>
                </div>
            )}

            {view === 'active' && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Live Terminals Feed ({activeRestaurantJobs.length})</h3>
                    {activeRestaurantJobs.length > 0 ? activeRestaurantJobs.map(job => (
                        <div key={job.id} className="bg-black border border-gray-800 p-5 rounded-[2rem] flex justify-between items-center group hover:border-lemon/20 transition-all">
                            <div>
                                <div className="flex items-center gap-2">
                                     <h4 className="text-white font-black uppercase text-sm">{job.restaurantName}</h4>
                                     <span className="text-[7px] bg-green-900 text-green-300 px-2 py-0.5 rounded-full uppercase font-black">Live</span>
                                </div>
                                <p className="text-lemon text-[10px] font-black uppercase mt-1">{job.category} • ₹{job.salary}</p>
                                <p className="text-gray-600 text-[9px] font-bold mt-1 uppercase truncate">{job.address}</p>
                            </div>
                            <button onClick={() => onDeleteRestaurantJob(job.id)} className="text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    )) : <p className="text-center py-20 text-gray-600 font-black uppercase text-[10px]">No active vacancies in feed</p>}
                </div>
            )}
        </div>
    );
};

export default AdminStaffHub;
