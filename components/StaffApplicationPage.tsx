
import React, { useState, useEffect } from 'react';
import { StaffApplication, RestaurantJobPost, StaffUser } from '../types';

interface StaffApplicationPageProps {
    onApply: (application: StaffApplication) => void;
    restaurantJobs: RestaurantJobPost[];
    registeredStaff: StaffUser[];
    onRegisterStaff: (name: string, phone: string) => StaffUser;
}

const StaffApplicationPage: React.FC<StaffApplicationPageProps> = ({ onApply, restaurantJobs = [], registeredStaff = [], onRegisterStaff }) => {
    const [view, setView] = useState<'feed' | 'apply' | 'account'>('feed');
    const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
        const saved = localStorage.getItem('babuSahabPos_activeStaff');
        return saved ? JSON.parse(saved) : null;
    });

    const [regForm, setRegForm] = useState({ name: '', phone: '' });
    const [appForm, setAppForm] = useState({ category: '', location: '', cvDetails: '' });

    // Sync current user and persistent login
    useEffect(() => {
        if (currentUser) {
            const latest = registeredStaff.find(u => u.id === currentUser.id);
            if (latest) {
                setCurrentUser(latest);
                localStorage.setItem('babuSahabPos_activeStaff', JSON.stringify(latest));
            }
        } else {
            localStorage.removeItem('babuSahabPos_activeStaff');
        }
    }, [registeredStaff, currentUser?.id]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = registeredStaff.find(u => u.phone === regForm.phone);
        if (user) {
            if (user.isBlocked) { alert("Your account is blocked."); return; }
            setCurrentUser(user);
        } else {
            const newUser = onRegisterStaff(regForm.name, regForm.phone);
            setCurrentUser(newUser);
        }
    };

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) { setView('account'); return; }
        if (currentUser.status !== 'Approved') { alert("Please wait for admin approval before posting your CV."); return; }
        
        onApply({ 
            id: Date.now(), 
            staffName: currentUser.name, 
            phone: currentUser.phone, 
            category: appForm.category, 
            location: appForm.location, 
            cvDetails: appForm.cvDetails, 
            timestamp: new Date(), 
            isRead: false 
        });
        alert("CV Published successfully!");
        setView('feed');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
            <header className="sticky top-0 z-20 bg-black/90 border-b border-gray-800 p-4 flex justify-between items-center backdrop-blur-md shrink-0">
                <h1 className="text-xl font-black text-lemon uppercase tracking-tighter">BaBu SAHAB <span className="text-white/40">STAFF HUB</span></h1>
                <div className="bg-lemon/10 px-3 py-1 rounded-full border border-lemon/20">
                     <span className="text-[10px] text-lemon font-black uppercase tracking-widest">{currentUser ? (currentUser.status === 'Approved' ? 'Verified Member' : 'Pending Verification') : 'Guest Mode'}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
                {view === 'feed' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
                            <h2 className="text-lg font-black uppercase text-white tracking-tighter">Restaurant Vacancies</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Direct contact for registered members</p>
                        </div>
                        {restaurantJobs.length > 0 ? restaurantJobs.slice().reverse().map(job => (
                            <div key={job.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
                                <span className="text-[9px] font-black text-lemon uppercase tracking-[0.2em]">{job.category}</span>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase mt-1 leading-none">{job.restaurantName}</h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase flex items-center gap-1 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>
                                    {job.address}
                                </p>
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5 my-4">
                                    <p className="text-lemon font-black text-xs uppercase tracking-widest">₹{job.salary} / Month</p>
                                </div>
                                
                                {currentUser?.status === 'Approved' ? (
                                    <a 
                                        href={`tel:${job.phone}`}
                                        className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-lemon text-black shadow-lg shadow-lemon/10 flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        CALL RESTAURANT
                                    </a>
                                ) : (
                                    <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Registration required to view contact info</p>
                                        <button onClick={() => setView('account')} className="text-lemon text-[10px] font-black uppercase mt-2 hover:underline">Register or Login Now</button>
                                    </div>
                                )}
                            </div>
                        )) : <div className="py-20 text-center text-gray-700 font-black uppercase text-[10px] tracking-widest">No active vacancies currently</div>}
                    </div>
                )}

                {view === 'account' && (
                    <div className="animate-fade-in">
                        {!currentUser ? (
                            <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-4 shadow-2xl">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-6">Worker Access</h2>
                                <p className="text-xs text-gray-400 font-bold mb-4 uppercase">Login with your mobile number to contact restaurants.</p>
                                <input placeholder="Full Name (For New Account)" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                                <input placeholder="Mobile Number" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} required />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 mt-4">Login / Register</button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center shadow-2xl">
                                    <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-gray-700 text-lemon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase text-white tracking-tighter">{currentUser.name}</h2>
                                    <p className="text-lemon font-bold text-[11px] tracking-widest mt-1">{currentUser.phone}</p>
                                    
                                    <div className={`mt-6 p-4 rounded-xl border ${currentUser.status === 'Approved' ? 'bg-green-600/10 border-green-600/30' : 'bg-yellow-600/10 border-yellow-600/30'}`}>
                                        <p className={`text-xs font-black uppercase ${currentUser.status === 'Approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                                            Account Status: {currentUser.status}
                                        </p>
                                        {currentUser.status !== 'Approved' && <p className="text-[9px] text-gray-500 uppercase mt-1 font-bold">Admin verification usually takes 1-2 hours</p>}
                                    </div>

                                    <button onClick={() => { setCurrentUser(null); localStorage.removeItem('babuSahabPos_activeStaff'); }} className="text-[9px] font-black text-red-500 uppercase mt-8 hover:underline">Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'apply' && (
                    <div className="animate-fade-in">
                        {currentUser?.status === 'Approved' ? (
                            <form onSubmit={handleJobSubmit} className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-4 shadow-2xl">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-4">Post Available Profile</h2>
                                <select className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} required>
                                    <option value="">Choose Skillset</option>
                                    <option>Head Chef</option><option>Assistant Chef</option><option>Waiter / Service</option><option>Restaurant Manager</option><option>Utility / Cleaning</option>
                                </select>
                                <input placeholder="Location (City/Area)" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={appForm.location} onChange={e => setAppForm({...appForm, location: e.target.value})} required />
                                <textarea placeholder="Tell owners about your experience..." className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold h-40" value={appForm.cvDetails} onChange={e => setAppForm({...appForm, cvDetails: e.target.value})} required />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20">Publish My Profile</button>
                            </form>
                        ) : (
                            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center shadow-2xl">
                                 <h2 className="text-xl font-black text-white uppercase mb-4">Access Denied</h2>
                                 <p className="text-gray-400 text-sm mb-6 uppercase">You must have an approved account to post a profile.</p>
                                 <button onClick={() => setView('account')} className="bg-lemon text-black font-black py-4 px-8 rounded-2xl text-[10px] uppercase">Login / Check Status</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800 h-20 px-4 flex justify-around items-center z-50 backdrop-blur-lg">
                <button onClick={() => setView('feed')} className={`flex flex-col items-center gap-1 transition-all ${view === 'feed' ? 'text-lemon' : 'text-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
                </button>

                <div className="relative">
                    <button onClick={() => setView('apply')} className="flex items-center justify-center w-16 h-16 -mt-10 rounded-full bg-lemon text-black shadow-2xl shadow-lemon/20 active:scale-90 transition-transform border-4 border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                </div>

                <button onClick={() => setView('account')} className={`flex flex-col items-center gap-1 transition-all ${view === 'account' ? 'text-lemon' : 'text-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4 4-4-4"/></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Account</span>
                </button>
            </nav>
        </div>
    );
};

export default StaffApplicationPage;
