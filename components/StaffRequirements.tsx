
import React, { useState } from 'react';
import { StaffJobPost } from '../types';

interface StaffRequirementsProps {
    jobPosts: StaffJobPost[];
    onSubmitRequirement: (req: string, salary: string) => void;
    onMessageStaff: (phone: string, text: string) => void;
}

const StaffRequirements: React.FC<StaffRequirementsProps> = ({ jobPosts, onSubmitRequirement, onMessageStaff }) => {
    const [showModal, setShowModal] = useState(false);
    const [showMsgModal, setShowMsgModal] = useState<{ name: string; phone: string } | null>(null);
    const [reqText, setReqText] = useState('');
    const [salary, setSalary] = useState('');
    const [msgText, setMsgText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reqText && salary) {
            onSubmitRequirement(reqText, salary);
            setReqText('');
            setSalary('');
            setShowModal(false);
            alert("Requirement submitted to Admin!");
        }
    };

    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (showMsgModal && msgText.trim()) {
            onMessageStaff(showMsgModal.phone, msgText);
            setMsgText('');
            setShowMsgModal(null);
            alert("Message sent successfully!");
        }
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-6">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shrink-0">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Staff Hub</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Connect with industry workers</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-lemon text-black font-black px-5 py-2.5 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/10 active:scale-95 transition-transform"
                >
                    Your Requirement
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-4">
                {jobPosts.length > 0 ? (
                    jobPosts.map(post => (
                        <div key={post.id} className="bg-black border border-gray-800 p-5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-lemon/10 text-lemon text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-lemon/20">Approved</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-lemon uppercase tracking-[0.2em]">{post.category}</span>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{post.staffName}</h3>
                                <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1 uppercase">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    {post.location}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-4 leading-relaxed line-clamp-3">"{post.cvDetails}"</p>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button 
                                    onClick={() => setShowMsgModal({ name: post.staffName, phone: post.phone })}
                                    className="flex-1 bg-gray-800 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-700 transition-colors"
                                >
                                    Message
                                </button>
                                <a 
                                    href={`tel:${post.phone}`}
                                    className="flex-1 bg-lemon text-black font-black py-3 rounded-xl text-[10px] uppercase tracking-widest text-center shadow-lg shadow-lemon/5"
                                >
                                    Call
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <p className="font-black uppercase text-[10px] tracking-widest text-center">No worker profiles approved yet</p>
                    </div>
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
                            <textarea value={reqText} onChange={e => setReqText(e.target.value)} placeholder="Ex. Need Head Chef for Indian Cuisine" className="w-full bg-black text-lemon text-[11px] p-3 rounded-xl border border-gray-800 focus:border-lemon outline-none font-bold" rows={3} required />
                            <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="Ex. 25,000 - 30,000" className="w-full bg-black text-lemon text-[11px] p-3 rounded-xl border border-gray-800 focus:border-lemon outline-none font-bold" required />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-lemon/10 active:scale-95 transition-all">Send to Admin</button>
                        </form>
                    </div>
                </div>
            )}

            {showMsgModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-800 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-white tracking-widest">Message {showMsgModal.name}</h3>
                            <button onClick={() => setShowMsgModal(null)} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSendMsg} className="space-y-4">
                            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Enter message to worker..." className="w-full bg-black text-white text-[11px] p-4 rounded-xl border border-gray-800 focus:border-lemon outline-none font-bold" rows={4} required />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-lemon/10 active:scale-95 transition-all">Send Inquiry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffRequirements;
