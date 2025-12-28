
import React, { useState, useEffect } from 'react';
import { StaffApplication, RestaurantJobPost, StaffUser } from '../types';

interface StaffApplicationPageProps {
    onApply: (application: StaffApplication) => void;
    restaurantJobs: RestaurantJobPost[];
    registeredStaff: StaffUser[];
    onRegisterStaff: (name: string, phone: string) => StaffUser;
    onSubscribeStaff: (userId: number) => void;
}

const StaffApplicationPage: React.FC<StaffApplicationPageProps> = ({ onApply, restaurantJobs, registeredStaff, onRegisterStaff, onSubscribeStaff }) => {
    const [view, setView] = useState<'feed' | 'apply' | 'account' | 'paywall'>('feed');
    const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
        const saved = localStorage.getItem('babuSahabPos_activeStaff');
        return saved ? JSON.parse(saved) : null;
    });

    const [regForm, setRegForm] = useState({ name: '', phone: '' });
    const [appForm, setAppForm] = useState({ category: '', location: '', cvDetails: '' });
    const [selectedJob, setSelectedJob] = useState<RestaurantJobPost | null>(null);

    // Sync current user to local storage and update from global staff registry
    useEffect(() => {
        if (currentUser) {
            // Find current user's latest data from the registry (e.g., if Admin approved subscription)
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

    const handleContactOwner = (job: RestaurantJobPost) => {
        if (!currentUser) { setView('account'); return; }
        if (currentUser.subscriptionStatus !== 'active') {
            setSelectedJob(job);
            setView('paywall');
        } else {
            window.location.href = `tel:${job.phone}`;
        }
    };

    const handlePaySubscription = () => {
        if (!currentUser) return;
        onSubscribeStaff(currentUser.id);
        // Status updates to 'pending' in global state via prop
        setView('feed');
    };

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) { alert("Please login first"); setView('account'); return; }
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
        alert("Profile Published!");
        setView('feed');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
            <header className="sticky top-0 z-20 bg-black/90 border-b border-gray-800 p-4 flex justify-between items-center backdrop-blur-md shrink-0">
                <h1 className="text-xl font-black text-lemon uppercase tracking-tighter">BaBu SAHAB <span className="text-white/40">STAFF HUB</span></h1>
                <div className="bg-lemon/10 px-3 py-1 rounded-full border border-lemon/20">
                     <span className="text-[10px] text-lemon font-black uppercase tracking-widest">{currentUser ? 'Logged In' : 'Guest'}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
                {view === 'feed' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
                            <h2 className="text-lg font-black uppercase text-white tracking-tighter">Restaurant Openings</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Found {restaurantJobs.length} live vacancies</p>
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
                                    <p className="text-lemon font-black text-xs uppercase tracking-widest">Monthly Salary: ₹{job.salary}</p>
                                </div>
                                <button 
                                    onClick={() => handleContactOwner(job)}
                                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentUser?.subscriptionStatus === 'active' ? 'bg-lemon text-black shadow-lg shadow-lemon/10' : 'bg-gray-800 text-gray-400'}`}
                                >
                                    {currentUser?.subscriptionStatus === 'active' ? (
                                        <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> CALL OWNER</>
                                    ) : currentUser?.subscriptionStatus === 'pending' ? (
                                        <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> APPROVAL PENDING</>
                                    ) : (
                                        <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> UNLOCK CONTACT</>
                                    )}
                                </button>
                            </div>
                        )) : <div className="py-20 text-center text-gray-700 font-black uppercase text-[10px]">No active jobs posted</div>}
                    </div>
                )}

                {view === 'account' && (
                    <div className="animate-fade-in">
                        {!currentUser ? (
                            <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-4">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-6">Staff Registration</h2>
                                <input placeholder="Full Name" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required />
                                <input placeholder="Phone Number" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} required />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 mt-4">Join Staff Registry</button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center">
                                    <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-gray-700 text-lemon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase text-white tracking-tighter">{currentUser.name}</h2>
                                    <p className="text-lemon font-bold text-[11px] tracking-widest mt-1">{currentUser.phone}</p>
                                    <button onClick={() => setCurrentUser(null)} className="text-[9px] font-black text-red-500 uppercase mt-4 hover:underline">Log Out</button>
                                </div>
                                
                                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Membership Status</p>
                                        <p className={`text-sm font-black uppercase mt-1 ${
                                            currentUser.subscriptionStatus === 'active' ? 'text-green-500' : 
                                            currentUser.subscriptionStatus === 'pending' ? 'text-blue-400' : 'text-yellow-500'
                                        }`}>
                                            {currentUser.subscriptionStatus === 'active' ? 'Premium Access' : 
                                             currentUser.subscriptionStatus === 'pending' ? 'Pending Approval' : 'Free Tier'}
                                        </p>
                                    </div>
                                    {currentUser.subscriptionStatus === 'none' && (
                                        <button onClick={() => setView('paywall')} className="bg-lemon text-black font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest">Upgrade</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'apply' && (
                    <form onSubmit={handleJobSubmit} className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-4 animate-fade-in">
                        <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-4">Post Your CV</h2>
                        <select className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} required>
                            <option value="">Choose Skill</option>
                            <option>Head Chef</option><option>Assistant Chef</option><option>Waiter</option><option>Manager</option><option>Cleaner</option>
                        </select>
                        <input placeholder="Preferred City/Location" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={appForm.location} onChange={e => setAppForm({...appForm, location: e.target.value})} required />
                        <textarea placeholder="Experience summary..." className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold h-40" value={appForm.cvDetails} onChange={e => setAppForm({...appForm, cvDetails: e.target.value})} required />
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20">Publish to Owner Feed</button>
                    </form>
                )}

                {view === 'paywall' && (
                    <div className="bg-gray-900 p-10 rounded-3xl border border-lemon/30 text-center animate-bounce-in">
                        <div className="w-16 h-16 bg-lemon/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFF00" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Unlock Contact</h2>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed uppercase font-bold text-[11px]">Contact restaurant owners directly. Unlimited calls to any job vacancy.</p>
                        <div className="bg-black/40 p-6 rounded-2xl border border-gray-800 mb-8">
                             <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Standard Plan</p>
                             <p className="text-4xl font-black text-lemon">₹9<span className="text-xs">/month</span></p>
                        </div>
                        <button onClick={handlePaySubscription} className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 mb-4">Request Access & Pay</button>
                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-4">Approval takes up to 1-2 hours</p>
                        <button onClick={() => setView('feed')} className="text-gray-500 font-black uppercase text-[9px] tracking-widest">Maybe Later</button>
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-gray-800 h-20 px-4 flex justify-around items-center z-50 backdrop-blur-lg">
                <button onClick={() => setView('feed')} className={`flex flex-col items-center gap-1 transition-all ${view === 'feed' ? 'text-lemon' : 'text-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
                </button>

                <div className="relative">
                    <button onClick={() => setView('apply')} className="flex items-center justify-center w-16 h-16 -mt-10 rounded-full bg-lemon text-black shadow-2xl shadow-lemon/20 active:scale-90 transition-transform border-4 border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>

                <button onClick={() => setView('account')} className={`flex flex-col items-center gap-1 transition-all ${view === 'account' ? 'text-lemon' : 'text-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span className="text-[8px] font-black uppercase tracking-widest">Account</span>
                </button>
            </nav>
        </div>
    );
};

export default StaffApplicationPage;
