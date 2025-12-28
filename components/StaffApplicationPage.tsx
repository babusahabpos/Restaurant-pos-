
import React, { useState } from 'react';
import { StaffApplication, RestaurantJobPost } from '../types';

interface StaffApplicationPageProps {
    onApply: (application: StaffApplication) => void;
    restaurantJobs: RestaurantJobPost[];
}

const StaffApplicationPage: React.FC<StaffApplicationPageProps> = ({ onApply, restaurantJobs }) => {
    const [view, setView] = useState<'feed' | 'apply' | 'account'>('feed');
    const [formData, setFormData] = useState({ staffName: '', category: '', phone: '', location: '', cvDetails: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApply({ ...formData, id: Date.now(), timestamp: new Date(), isRead: false });
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setView('feed'); }, 3000);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <header className="sticky top-0 z-20 bg-black/90 border-b border-gray-800 p-4 flex justify-between items-center backdrop-blur-md">
                <h1 className="text-xl font-black text-lemon uppercase tracking-tighter">BaBu SAHAB <span className="text-white/40">STAFF HUB</span></h1>
                <div className="w-8 h-8 bg-gray-900 rounded-full border border-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
                {view === 'feed' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 mb-6">
                            <h2 className="text-lg font-black uppercase text-white tracking-tighter">Available Openings</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Connect directly with restaurant owners</p>
                        </div>
                        {restaurantJobs.length > 0 ? (
                            restaurantJobs.slice().reverse().map(job => (
                                <div key={job.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3">
                                        <span className="bg-green-600/10 text-green-500 text-[8px] font-black px-3 py-1 rounded-full uppercase border border-green-500/20">Active</span>
                                    </div>
                                    <span className="text-[9px] font-black text-lemon uppercase tracking-widest">{job.category}</span>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase mt-1 leading-none">{job.restaurantName}</h3>
                                    <p className="text-xs text-gray-400 font-bold mt-2 flex items-center gap-1 uppercase">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>
                                        {job.address}
                                    </p>
                                    <div className="bg-black/50 p-3 rounded-xl border border-white/5 my-4">
                                        <p className="text-lemon font-black text-sm uppercase">Monthly Salary: ₹{job.salary}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => alert(`Address: ${job.address}\nCategory: ${job.category}`)} className="flex-1 bg-gray-800 text-white font-black py-3 rounded-xl text-[10px] uppercase">View Details</button>
                                        <a href={`tel:${job.phone}`} className="flex-1 bg-lemon text-black font-black py-3 rounded-xl text-[10px] uppercase text-center shadow-lg shadow-lemon/10">Call Now</a>
                                    </div>
                                </div>
                            ))
                        ) : <div className="py-20 text-center text-gray-600 font-black uppercase text-[10px] tracking-widest">No jobs posted by admin yet</div>}
                    </div>
                )}

                {view === 'apply' && (
                    <div className="animate-fade-in">
                        {submitted ? (
                            <div className="bg-green-600/10 border border-green-500/30 p-8 rounded-3xl text-center">
                                <h2 className="text-2xl font-black text-green-400 uppercase tracking-tighter">Application Sent!</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase mt-2">Owners will contact you if shortlisted.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-3xl border border-gray-800 space-y-4">
                                <h2 className="text-xl font-black text-lemon uppercase tracking-tighter mb-4">Create Job Profile</h2>
                                <input placeholder="Full Name" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={formData.staffName} onChange={e => setFormData({...formData, staffName: e.target.value})} required />
                                <select className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                    <option value="">Select Category</option>
                                    <option>Head Chef</option><option>Assistant Chef</option><option>Waiter</option><option>Manager</option><option>Delivery</option>
                                </select>
                                <input placeholder="Mobile Number" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                <input placeholder="Your Location" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                                <textarea placeholder="Describe your experience..." className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold h-32" value={formData.cvDetails} onChange={e => setFormData({...formData, cvDetails: e.target.value})} required />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Submit to registry</button>
                            </form>
                        )}
                    </div>
                )}

                {view === 'account' && (
                    <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-gray-700">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <h2 className="text-xl font-black uppercase text-white tracking-tighter">Your Profile</h2>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">Manage your data visibility</p>
                        <div className="mt-8 space-y-2">
                             <button className="w-full bg-black/50 text-gray-400 font-bold py-3 rounded-xl border border-white/5 text-[10px] uppercase">My Applications</button>
                             <button className="w-full bg-black/50 text-gray-400 font-bold py-3 rounded-xl border border-white/5 text-[10px] uppercase">Notification Settings</button>
                        </div>
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-20 px-6 flex justify-between items-center z-30 backdrop-blur-md">
                <button onClick={() => setView('account')} className={`flex flex-col items-center gap-1 transition-all ${view === 'account' ? 'text-lemon' : 'text-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Account</span>
                </button>
                <button onClick={() => setView('apply')} className="flex items-center justify-center w-14 h-14 -mt-10 rounded-full bg-lemon text-black shadow-xl shadow-lemon/20 active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button onClick={() => setView('feed')} className={`flex flex-col items-center gap-1 transition-all ${view === 'feed' ? 'text-lemon' : 'text-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
                </button>
            </nav>
        </div>
    );
};

export default StaffApplicationPage;
