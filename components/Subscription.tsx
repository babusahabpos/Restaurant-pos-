
import React, { useMemo } from 'react';
import { RegisteredUser } from '../types';

interface SubscriptionProps {
    user: RegisteredUser;
    onRequestRenewal: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ user, onRequestRenewal }) => {
    const daysRemaining = useMemo(() => {
        const end = new Date(user.subscriptionEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [user.subscriptionEndDate]);

    return (
        <div className="bg-black p-4 md:p-8 h-full overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lemon"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        Business Status
                    </h3>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your POS terminal validity and features.</p>
                </div>

                <div className="bg-gray-900 border-2 border-lemon p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                         <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <span className="bg-lemon text-black text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Active Plan</span>
                            <h4 className="text-3xl font-black text-white mt-4 uppercase tracking-tighter">BaBu Sahab Premium</h4>
                            <p className="text-gray-400 font-bold text-sm mt-2">Full access to Cloud Billing, QR Menu, and Inventory Hub.</p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Time Remaining</p>
                            <p className="text-4xl font-black text-lemon mt-1 tracking-tighter">{daysRemaining} Days</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Ends: {user.subscriptionEndDate}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={onRequestRenewal}
                        className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] hover:bg-lemon-dark transition shadow-xl shadow-lemon/20 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                        Request Plan Renewal
                    </button>
                    <p className="text-center text-[9px] text-gray-500 font-black uppercase tracking-widest">A renewal message will be sent to the Admin Hub.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-6 rounded-[2rem] border border-gray-800">
                        <h5 className="text-white font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-4 mb-4">Included Features</h5>
                        <ul className="space-y-3">
                            {['Unlimited POS Billing', 'Dynamic QR Menu Generation', 'Real-time Stock Tracking', 'Multi-staff Attendance', 'Advanced Profit Reports', '24/7 Priority Support'].map(f => (
                                <li key={f} className="flex items-center gap-3 text-gray-300 text-[11px] font-bold uppercase">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFF00" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gray-900/50 p-6 rounded-[2rem] border border-gray-800 flex flex-col justify-between">
                         <div>
                            <h5 className="text-white font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-4 mb-4">Pricing Cycle</h5>
                            <p className="text-gray-400 text-[11px] font-bold leading-relaxed">Your current billing cycle is Monthly. Referral rewards will automatically extend your plan for free.</p>
                         </div>
                         <div className="mt-8">
                            <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Monthly Rate</p>
                            <p className="text-4xl font-black text-white tracking-tighter mt-1">₹99 <span className="text-sm text-gray-600">/mo</span></p>
                         </div>
                    </div>
                </div>
                
                <p className="text-[9px] text-gray-700 text-center uppercase font-black tracking-widest pt-10">For manual billing or plan upgrades, contact: diptifoodice@gmail.com</p>
            </div>
        </div>
    );
};

export default Subscription;
