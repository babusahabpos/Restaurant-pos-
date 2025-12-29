
import React, { useState, useEffect, useMemo } from 'react';
import { StaffApplication, RestaurantJobPost, StaffUser } from '../types';

interface StaffApplicationPageProps {
    onApply: (application: StaffApplication) => void;
    restaurantJobs: RestaurantJobPost[];
    registeredStaff: StaffUser[];
    onRegisterStaff: (name: string, phone: string) => StaffUser;
}

const JobDetailModal: React.FC<{ job: RestaurantJobPost; onClose: () => void; isVerified: boolean; onSignIn: () => void }> = ({ job, onClose, isVerified, onSignIn }) => (
    <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
            <div className="bg-lemon p-6 text-black flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-[10px] bg-black text-white px-3 py-1 rounded-full">{job.category}</span>
                <button onClick={onClose} className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center font-black">&times;</button>
            </div>
            <div className="p-8 space-y-6">
                <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{job.restaurantName}</h3>
                    <p className="text-lemon font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>
                         {job.address}
                    </p>
                </div>

                <div className="bg-black/50 p-6 rounded-3xl border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Monthly Salary</p>
                    <p className="text-3xl font-black text-lemon tracking-tighter">₹{job.salary}</p>
                </div>

                {isVerified ? (
                    <a 
                        href={`tel:${job.phone}`}
                        className="w-full bg-lemon text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        CALL RECRUITER
                    </a>
                ) : (
                    <div className="bg-gray-800/50 p-5 rounded-2xl text-center border border-dashed border-gray-700">
                        <p className="text-[10px] text-gray-500 font-black uppercase leading-relaxed italic">Verification required to view contact number</p>
                        <button onClick={onSignIn} className="text-lemon font-black uppercase text-[10px] mt-2 underline tracking-widest">Sign In / Register</button>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const StaffApplicationPage: React.FC<StaffApplicationPageProps> = ({ onApply, restaurantJobs = [], registeredStaff = [], onRegisterStaff }) => {
    const [view, setView] = useState<'feed' | 'apply' | 'account'>('feed');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState<RestaurantJobPost | null>(null);
    const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
        const saved = localStorage.getItem('babuSahabPos_activeStaff');
        return saved ? JSON.parse(saved) : null;
    });

    const [regForm, setRegForm] = useState({ name: '', phone: '' });
    const [appForm, setAppForm] = useState({ category: '', location: '', cvDetails: '' });

    useEffect(() => {
        if (currentUser) {
            const latest = registeredStaff.find(u => u.phone === currentUser.phone);
            if (latest) {
                setCurrentUser(latest);
                localStorage.setItem('babuSahabPos_activeStaff', JSON.stringify(latest));
            }
        }
    }, [registeredStaff, currentUser?.phone]);

    const handleLoginRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!regForm.phone || regForm.phone.length < 10) { alert("Invalid phone."); return; }
        const existing = registeredStaff.find(u => u.phone === regForm.phone);
        if (existing) {
            if (existing.isBlocked) { alert("Account blocked."); return; }
            setCurrentUser(existing);
            localStorage.setItem('babuSahabPos_activeStaff', JSON.stringify(existing));
            setView('feed');
        } else {
            if (!regForm.name) { alert("Full name required."); return; }
            const newUser = onRegisterStaff(regForm.name, regForm.phone);
            setCurrentUser(newUser);
            localStorage.setItem('babuSahabPos_activeStaff', JSON.stringify(newUser));
            setView('feed');
        }
    };

    const handleCVSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || currentUser.status !== 'Approved') { alert("Verification pending."); return; }
        onApply({ id: Date.now(), staffName: currentUser.name, phone: currentUser.phone, category: appForm.category, location: appForm.location, cvDetails: appForm.cvDetails, timestamp: new Date(), isRead: false });
        alert("CV Published!");
        setView('feed');
    };

    const filteredJobs = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return restaurantJobs.filter(j => 
            j.category.toLowerCase().includes(q) || 
            j.location?.toLowerCase().includes(q) || // location might be in address
            j.address?.toLowerCase().includes(q)
        );
    }, [restaurantJobs, searchTerm]);

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
            {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} isVerified={currentUser?.status === 'Approved'} onSignIn={() => { setSelectedJob(null); setView('account'); }} />}

            <header className="sticky top-0 z-20 bg-black border-b border-gray-800 p-4 flex flex-col gap-4 shadow-xl shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-black text-lemon uppercase tracking-tighter">BaBu SAHAB <span className="text-white/40">STAFF LINK</span></h1>
                    <div className="bg-lemon/10 px-3 py-1 rounded-full border border-lemon/20 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentUser?.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-[10px] text-lemon font-black uppercase tracking-widest">{currentUser?.status || 'Guest'}</span>
                    </div>
                </div>
                {view === 'feed' && (
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search by role or location..." 
                            className="w-full bg-gray-900 text-white p-3.5 pl-10 rounded-2xl border border-gray-800 outline-none focus:border-lemon/50 font-bold text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-3 top-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
                {view === 'feed' && (
                    <div className="space-y-4 animate-fade-in">
                        {filteredJobs.length > 0 ? filteredJobs.slice().reverse().map(job => (
                            <div key={job.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] flex justify-between items-center shadow-lg group active:scale-[0.98] transition-all">
                                <div>
                                    <span className="text-[8px] font-black text-lemon uppercase tracking-[0.2em]">{job.category}</span>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mt-1">{job.address?.split(',')[0] || 'Unknown Location'}</h3>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">Verified Vacancy</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedJob(job)}
                                    className="bg-gray-800 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest border border-white/5 hover:bg-lemon hover:text-black transition-colors"
                                >
                                    View
                                </button>
                            </div>
                        )) : <div className="py-20 text-center text-gray-700 font-black uppercase text-[10px] tracking-widest opacity-50 italic">No matches found</div>}
                    </div>
                )}

                {view === 'account' && (
                    <div className="animate-fade-in">
                        {!currentUser ? (
                            <form onSubmit={handleLoginRegister} className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4 shadow-2xl">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-2">Worker Portal</h2>
                                <p className="text-xs text-gray-400 font-bold mb-6 uppercase tracking-tight">Login with mobile or create free account.</p>
                                <input placeholder="Mobile Number" type="tel" maxLength={10} className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} required />
                                <input placeholder="Full Name (For New Workers)" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 mt-6 active:scale-95 transition-all">Continue</button>
                            </form>
                        ) : (
                            <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 text-center shadow-2xl">
                                <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-gray-700 text-lemon shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                                <h2 className="text-2xl font-black uppercase text-white tracking-tighter">{currentUser.name}</h2>
                                <p className="text-lemon font-bold text-[11px] tracking-widest mt-1 opacity-70">{currentUser.phone}</p>
                                <div className={`mt-8 p-5 rounded-[1.5rem] border ${currentUser.status === 'Approved' ? 'bg-green-600/10 border-green-600/30' : 'bg-yellow-600/10 border-yellow-600/30'}`}>
                                    <p className={`text-xs font-black uppercase ${currentUser.status === 'Approved' ? 'text-green-500' : 'text-yellow-500'}`}>Status: {currentUser.status}</p>
                                    {currentUser.status !== 'Approved' && <p className="text-[9px] text-gray-500 uppercase mt-2 font-bold leading-relaxed">Admin will verify your identity. Usually 1-2 hours.</p>}
                                </div>
                                <button onClick={() => { setCurrentUser(null); localStorage.removeItem('babuSahabPos_activeStaff'); }} className="text-[10px] font-black text-red-500 uppercase mt-10 hover:underline tracking-widest">Sign Out</button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'apply' && (
                    <div className="animate-fade-in">
                        {currentUser?.status === 'Approved' ? (
                            <form onSubmit={handleCVSubmit} className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4 shadow-2xl">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-4">Worker Profile</h2>
                                <select className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} required>
                                    <option value="">Select Role</option>
                                    <option>Head Chef</option><option>Assistant Chef</option><option>Waiter / Service</option><option>Manager</option><option>Housekeeping</option>
                                </select>
                                <input placeholder="Location (City/Area)" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={appForm.location} onChange={e => setAppForm({...appForm, location: e.target.value})} required />
                                <textarea placeholder="Describe your experience & expected salary..." className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold h-40" value={appForm.cvDetails} onChange={e => setAppForm({...appForm, cvDetails: e.target.value})} required />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase tracking-widest text-xs shadow-xl shadow-lemon/20">Publish Profile</button>
                            </form>
                        ) : (
                            <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 text-center shadow-2xl">
                                <div className="bg-gray-800 w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-lemon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                                <h2 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Verified Access Only</h2>
                                <p className="text-gray-400 text-sm mb-8 uppercase font-bold tracking-tight">Approved account required to publish CV.</p>
                                <button onClick={() => setView('account')} className="bg-lemon text-black font-black py-4 px-10 rounded-2xl text-[10px] uppercase shadow-lg shadow-lemon/10">Sign In / Check Status</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800 h-20 px-4 flex justify-around items-center z-[100] backdrop-blur-lg shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                <button onClick={() => setView('feed')} className={`flex flex-col items-center gap-1 transition-all ${view === 'feed' ? 'text-lemon' : 'text-gray-600'}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg><span className="text-[8px] font-black uppercase tracking-widest">Job Feed</span></button>
                <div className="relative"><button onClick={() => setView('apply')} className="flex items-center justify-center w-16 h-16 -mt-10 rounded-full bg-lemon text-black shadow-2xl shadow-lemon/30 border-4 border-black"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button></div>
                <button onClick={() => setView('account')} className={`flex flex-col items-center gap-1 transition-all ${view === 'account' ? 'text-lemon' : 'text-gray-600'}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4 4-4-4"/></svg><span className="text-[8px] font-black uppercase tracking-widest">Account</span></button>
            </nav>
        </div>
    );
};

export default StaffApplicationPage;
