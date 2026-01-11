
import React, { useState } from 'react';
import { StaffJobPost, RestaurantJobPost } from '../types';

interface StaffRequirementsProps {
    jobPosts: StaffJobPost[];
    activeRestaurantJobs: RestaurantJobPost[];
    onSubmitRequirement: (req: string, salary: string) => void;
    onMessageStaff: (phone: string, text: string) => void;
}

const StaffRequirements: React.FC<StaffRequirementsProps> = ({ jobPosts, activeRestaurantJobs, onSubmitRequirement, onMessageStaff }) => {
    const [showModal, setShowModal] = useState(false);
    const [showMsgModal, setShowMsgModal] = useState<{ name: string; phone: string } | null>(null);
    const [reqText, setReqText] = useState('');
    const [salary, setSalary] = useState('');
    const [msgText, setMsgText] = useState('');
    const [view, setView] = useState<'admin_posts' | 'workers'>('admin_posts');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reqText && salary) {
            onSubmitRequirement(reqText, salary);
            setReqText('');
            setSalary('');
            setShowModal(false);
            alert("Requirement submitted to Admin Hub!");
        }
    };

    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (showMsgModal && msgText.trim()) {
            onMessageStaff(showMsgModal.phone, msgText);
            setMsgText('');
            setShowMsgModal(null);
            alert("Inquiry sent successfully!");
        }
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shrink-0">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">STAFF HUB</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Industry Network</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-lemon text-black font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-transform"
                >
                    Post Need
                </button>
            </div>

            <div className="flex gap-2 bg-gray-900/40 p-1.5 rounded-xl border border-gray-800 shrink-0">
                <button onClick={() => setView('admin_posts')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'admin_posts' ? 'bg-lemon text-black' : 'text-gray-500'}`}>Official Posts</button>
                <button onClick={() => setView('workers')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'workers' ? 'bg-lemon text-black' : 'text-gray-500'}`}>Available Workers</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-4">
                {view === 'admin_posts' ? (
                    activeRestaurantJobs.length > 0 ? (
                        activeRestaurantJobs.map(job => (
                            <div key={job.id} className="bg-black border border-gray-800 p-5 rounded-[2rem] relative overflow-hidden group hover:border-lemon/30 transition-all">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="bg-green-600/10 text-green-500 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-600/20">Official</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-lemon uppercase tracking-[0.2em]">{job.category}</span>
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">{job.restaurantName}</h3>
                                    <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1 uppercase">{job.address}</p>
                                    <p className="text-lemon font-black text-sm mt-3">Monthly: ₹{job.salary}</p>
                                </div>
                                <div className="mt-5">
                                    <a href={`tel:${job.phone}`} className="block w-full bg-gray-800 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest text-center shadow-lg active:scale-95 transition-all">Call & Inquiry</a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-700 opacity-30">
                            <p className="font-black uppercase text-[10px] tracking-widest text-center">No official posts at this moment</p>
                        </div>
                    )
                ) : (
                    jobPosts.length > 0 ? (
                        jobPosts.map(post => (
                            <div key={post.id} className="bg-black border border-gray-800 p-5 rounded-[2rem] relative overflow-hidden group">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-lemon uppercase tracking-[0.2em]">{post.category}</span>
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">{post.staffName}</h3>
                                    <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1 uppercase">{post.location}</p>
                                    <p className="text-gray-500 text-[10px] mt-4 leading-relaxed line-clamp-3">"{post.cvDetails}"</p>
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button 
                                        onClick={() => setShowMsgModal({ name: post.staffName, phone: post.phone })}
                                        className="flex-1 bg-gray-800 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:scale-95"
                                    >
                                        Message
                                    </button>
                                    <a href={`tel:${post.phone}`} className="flex-1 bg-lemon text-black font-black py-3 rounded-xl text-[10px] uppercase tracking-widest text-center shadow-lg active:scale-95">Call Now</a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-700 opacity-30">
                            <p className="font-black uppercase text-[10px] tracking-widest text-center">No profiles found</p>
                        </div>
                    )
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-800 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-lemon tracking-widest">Request Staff</h3>
                            <button onClick={() => setShowModal(false)} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea value={reqText} onChange={e => setReqText(e.target.value)} placeholder="What role do you need?" className="w-full bg-black text-lemon text-[11px] p-3 rounded-xl border border-gray-800 focus:border-lemon outline-none font-bold" rows={3} required />
                            <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="Salary Budget" className="w-full bg-black text-lemon text-[11px] p-3 rounded-xl border border-gray-800 focus:border-lemon outline-none font-bold" required />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Submit Need</button>
                        </form>
                    </div>
                </div>
            )}

            {showMsgModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-800 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-white tracking-widest">Inquiry to {showMsgModal.name}</h3>
                            <button onClick={() => setShowMsgModal(null)} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSendMsg} className="space-y-4">
                            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Write your message to the worker..." className="w-full bg-black text-white text-[11px] p-4 rounded-xl border border-gray-800 focus:border-lemon outline-none font-bold" rows={4} required />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Send Inquiry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffRequirements;
