
import React, { useState } from 'react';
import { StaffApplication, RestaurantJobPost } from '../../types';

interface AdminStaffHubProps {
    applications: StaffApplication[];
    onDeleteApp: (id: number) => void;
    onPostApp: (app: StaffApplication) => void;
    onMarkRead: (id: number) => void;
    onCreateJob: (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => void;
    activeJobs: RestaurantJobPost[];
    onDeleteJob: (id: number) => void;
}

const AdminStaffHub: React.FC<AdminStaffHubProps> = ({ applications, onDeleteApp, onPostApp, onMarkRead, onCreateJob, activeJobs, onDeleteJob }) => {
    const [view, setView] = useState<'inbox' | 'create' | 'active'>('inbox');
    const [jobForm, setJobForm] = useState({
        restaurantName: '',
        address: '',
        category: '',
        salary: '',
        phone: ''
    });

    const handleContact = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const handleMessage = (phone: string, name: string) => {
        const text = encodeURIComponent(`Hello ${name}, we saw your application on BaBu SAHAB Staff Hub...`);
        window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
    };

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateJob(jobForm);
        setJobForm({ restaurantName: '', address: '', category: '', salary: '', phone: '' });
        setView('active');
    };

    const sortedApps = [...applications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800">
                <button 
                    onClick={() => setView('inbox')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'inbox' ? 'bg-lemon text-black shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Staff Inbox ({applications.filter(a => !a.isRead).length})
                </button>
                <button 
                    onClick={() => setView('create')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'create' ? 'bg-lemon text-black shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Post Restaurant Job
                </button>
                <button 
                    onClick={() => setView('active')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'active' ? 'bg-lemon text-black shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Active Vacancies ({activeJobs.length})
                </button>
            </div>

            {view === 'inbox' && (
                <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                    {sortedApps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedApps.map(app => (
                                <div key={app.id} className="bg-black p-5 rounded-2xl border border-gray-800 flex flex-col justify-between relative overflow-hidden group">
                                    {!app.isRead && <span className="absolute top-2 right-2 w-2 h-2 bg-lemon rounded-full animate-pulse"></span>}
                                    <div>
                                        <span className="text-[9px] font-black text-lemon uppercase tracking-widest">{app.category}</span>
                                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mt-1">{app.staffName}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">{app.location} • {new Date(app.timestamp).toLocaleDateString()}</p>
                                        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800 my-4">
                                            <p className="text-gray-400 text-[11px] leading-relaxed italic">"{app.cvDetails}"</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleContact(app.phone)} className="bg-gray-800 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-widest">Contact</button>
                                        <button onClick={() => onPostApp(app)} className="bg-lemon text-black font-black py-3 rounded-xl text-[9px] uppercase tracking-widest">Post to Hub</button>
                                        <button onClick={() => handleMessage(app.phone, app.staffName)} className="bg-blue-600/10 text-blue-400 border border-blue-600/30 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest">WhatsApp</button>
                                        <button onClick={() => onDeleteApp(app.id)} className="bg-red-600/10 text-red-500 border border-red-600/30 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center py-20 text-gray-600 font-black uppercase text-[10px]">No staff applications yet</p>}
                </div>
            )}

            {view === 'create' && (
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                    <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tighter">Create New Job Vacancy</h3>
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Restaurant Name" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.restaurantName} onChange={e => setJobForm({...jobForm, restaurantName: e.target.value})} required />
                            <input placeholder="Job Category (Ex. Chef, Waiter)" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.category} onChange={e => setJobForm({...jobForm, category: e.target.value})} required />
                        </div>
                        <input placeholder="Address / Location" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.address} onChange={e => setJobForm({...jobForm, address: e.target.value})} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Monthly Salary Range" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} required />
                            <input placeholder="Contact Phone Number" className="bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={jobForm.phone} onChange={e => setJobForm({...jobForm, phone: e.target.value})} required />
                        </div>
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 active:scale-95 transition-all">Publish vacancy to staff feed</button>
                    </form>
                </div>
            )}

            {view === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeJobs.length > 0 ? activeJobs.map(job => (
                        <div key={job.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-black uppercase">{job.restaurantName}</h4>
                                <p className="text-lemon text-[10px] font-bold uppercase">{job.category} • ₹{job.salary}</p>
                                <p className="text-gray-500 text-[9px] uppercase mt-1">{job.address}</p>
                            </div>
                            <button onClick={() => onDeleteJob(job.id)} className="bg-red-600/10 text-red-500 p-3 rounded-xl border border-red-600/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    )) : <p className="col-span-2 text-center py-20 text-gray-700 font-black uppercase text-[10px]">No active vacancies posted</p>}
                </div>
            )}
        </div>
    );
};

export default AdminStaffHub;
