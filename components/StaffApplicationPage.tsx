
import React, { useState, useEffect, useMemo } from 'react';
import { StaffApplication, RestaurantJobPost, StaffUser, StaffMessage } from '../types';

interface StaffApplicationPageProps {
    onApply: (application: Omit<StaffApplication, 'id' | 'timestamp' | 'isRead'>) => void;
    restaurantJobs: RestaurantJobPost[];
    registeredStaff: StaffUser[];
    onRegisterStaff: (name: string, phone: string) => StaffUser;
    messages: StaffMessage[];
    onMarkMessageRead: (id: number) => void;
}

const StaffApplicationPage: React.FC<StaffApplicationPageProps> = ({ onApply, restaurantJobs = [], registeredStaff = [], onRegisterStaff, messages, onMarkMessageRead }) => {
    const [view, setView] = useState<'feed' | 'apply' | 'account' | 'messages'>('feed');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
        const saved = localStorage.getItem('babuSahabPos_activeStaff');
        return saved ? JSON.parse(saved) : null;
    });

    const [regForm, setRegForm] = useState({ name: '', phone: '' });
    const [appForm, setAppForm] = useState({ category: '', location: '', cvDetails: '' });

    const userMessages = useMemo(() => 
        messages.filter(m => m.recipientPhone === currentUser?.phone), 
    [messages, currentUser?.phone]);

    const handleLoginRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!regForm.phone || regForm.phone.length < 10) { alert("Invalid phone."); return; }
        const existing = registeredStaff.find(u => u.phone === regForm.phone);
        if (existing) {
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
        if (!currentUser) return;
        onApply({ staffName: currentUser.name, phone: currentUser.phone, category: appForm.category, location: appForm.location, cvDetails: appForm.cvDetails });
        setView('feed');
    };

    const unreadCount = userMessages.filter(m => !m.isRead).length;

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
            <header className="sticky top-0 z-20 bg-black border-b border-gray-800 p-4 flex flex-col gap-4 shadow-xl shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-black text-lemon uppercase tracking-tighter">BaBu SAHAB <span className="text-white/40">STAFF LINK</span></h1>
                    <div className="bg-lemon/10 px-3 py-1 rounded-full border border-lemon/20 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentUser ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-[10px] text-lemon font-black uppercase tracking-widest">{currentUser ? 'Verified' : 'Guest'}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
                {view === 'feed' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-900/50 p-6 rounded-[2rem] border border-dashed border-gray-800 text-center mb-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Available Vacancies</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Direct from restaurant owners</p>
                        </div>
                        {restaurantJobs.length > 0 ? restaurantJobs.slice().reverse().map(job => (
                            <div key={job.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] flex justify-between items-center shadow-lg group">
                                <div className="min-w-0 pr-4">
                                    <span className="text-[8px] font-black text-lemon uppercase tracking-[0.2em]">{job.category}</span>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mt-1 truncate">{job.restaurantName}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60 truncate">{job.address}</p>
                                </div>
                                <a href={`tel:${job.phone}`} className="bg-lemon text-black font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-lemon/10 shrink-0">Call</a>
                            </div>
                        )) : <div className="py-20 text-center text-gray-700 font-black uppercase text-[10px] tracking-widest opacity-50 italic">No job postings today</div>}
                    </div>
                )}

                {view === 'messages' && (
                    <div className="animate-fade-in space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Messages Inbox</h2>
                        {userMessages.length > 0 ? userMessages.slice().reverse().map(msg => (
                            <div key={msg.id} onClick={() => onMarkMessageRead(msg.id)} className={`p-6 rounded-[2rem] border transition-all ${msg.isRead ? 'bg-gray-900/50 border-gray-800' : 'bg-lemon/10 border-lemon/30 shadow-lg'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] font-black text-lemon uppercase tracking-widest">From: {msg.senderName}</span>
                                    <span className="text-[8px] text-gray-500 font-black">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-white font-bold text-sm leading-relaxed">"{msg.text}"</p>
                                <div className="mt-4 flex gap-3">
                                    <button className="text-[9px] font-black text-lemon uppercase hover:underline">Reply via Call</button>
                                    {!msg.isRead && <span className="bg-red-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">New</span>}
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-30 grayscale flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                <p className="font-black uppercase text-xs tracking-widest">Inbox is empty</p>
                            </div>
                        )}
                    </div>
                )}

                {view === 'account' && (
                    <div className="animate-fade-in">
                        {!currentUser ? (
                            <form onSubmit={handleLoginRegister} className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4 shadow-2xl">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-2">Worker Portal</h2>
                                <p className="text-xs text-gray-400 font-bold mb-6 uppercase tracking-tight">Login instantly with your number.</p>
                                <input placeholder="Mobile Number" type="tel" maxLength={10} className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} required />
                                <input placeholder="Full Name (New Workers)" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase tracking-widest text-xs mt-6">Continue</button>
                            </form>
                        ) : (
                            <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 text-center shadow-2xl">
                                <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-lemon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                                <h2 className="text-2xl font-black uppercase text-white tracking-tighter">{currentUser.name}</h2>
                                <p className="text-lemon font-bold text-[11px] tracking-widest mt-1 opacity-70">{currentUser.phone}</p>
                                <button onClick={() => { setCurrentUser(null); localStorage.removeItem('babuSahabPos_activeStaff'); }} className="text-[10px] font-black text-red-500 uppercase mt-10 hover:underline tracking-widest">Sign Out</button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'apply' && (
                    <div className="animate-fade-in">
                        {currentUser ? (
                            <form onSubmit={handleCVSubmit} className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4 shadow-2xl">
                                <h2 className="text-2xl font-black text-lemon uppercase tracking-tighter mb-4">Worker Profile</h2>
                                <select className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} required>
                                    <option value="">Select Role</option>
                                    <option>Head Chef</option><option>Assistant Chef</option><option>Waiter / Service</option><option>Manager</option><option>Housekeeping</option>
                                </select>
                                <input placeholder="Location (City/Area)" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={appForm.location} onChange={e => setAppForm({...appForm, location: e.target.value})} required />
                                <textarea placeholder="Describe your experience & expected salary..." className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold h-40" value={appForm.cvDetails} onChange={e => setAppForm({...appForm, cvDetails: e.target.value})} required />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase tracking-widest text-xs shadow-xl shadow-lemon/20">Submit for Approval</button>
                                <p className="text-center text-[9px] text-gray-500 uppercase font-bold mt-4 italic">Post will go live after admin review.</p>
                            </form>
                        ) : (
                            <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 text-center shadow-2xl">
                                <h2 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Sign In Required</h2>
                                <button onClick={() => setView('account')} className="bg-lemon text-black font-black py-4 px-10 rounded-2xl text-[10px] uppercase shadow-lg shadow-lemon/10">Sign In / Register</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-20 px-4 flex justify-around items-center z-[100] backdrop-blur-lg">
                <button onClick={() => setView('feed')} className={`flex flex-col items-center gap-1 ${view === 'feed' ? 'text-lemon' : 'text-gray-600'}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg><span className="text-[8px] font-black uppercase tracking-widest">Feed</span></button>
                <button onClick={() => setView('messages')} className={`flex flex-col items-center gap-1 relative ${view === 'messages' ? 'text-lemon' : 'text-gray-600'}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg><span className="text-[8px] font-black uppercase tracking-widest">Inbox</span>{unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-black">{unreadCount}</span>}</button>
                <div className="relative"><button onClick={() => setView('apply')} className="flex items-center justify-center w-14 h-14 -mt-10 rounded-full bg-lemon text-black shadow-2xl border-4 border-black"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button></div>
                <button onClick={() => setView('account')} className={`flex flex-col items-center gap-1 ${view === 'account' ? 'text-lemon' : 'text-gray-600'}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4 4-4-4"/></svg><span className="text-[8px] font-black uppercase tracking-widest">Account</span></button>
            </nav>
        </div>
    );
};

export default StaffApplicationPage;
