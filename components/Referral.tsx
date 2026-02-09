
import React, { useState } from 'react';
import { RegisteredUser } from '../types';

interface ReferralProps {
    user: RegisteredUser;
}

const Referral: React.FC<ReferralProps> = ({ user }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (user.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}?ref=${user.referralCode}`;
        const shareData = {
            title: 'BaBu SAHAB POS - Join Now!',
            text: `Use my referral code ${user.referralCode} to join BaBu SAHAB POS and manage your restaurant efficiently!`,
            url: shareUrl
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => console.error('Error sharing', err));
        } else {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            alert('Sharing link copied to clipboard!');
        }
    };

    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-24 p-4 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-10 rounded-[3rem] shadow-2xl border border-gray-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-lemon"></div>
                    
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Refer & <span className="text-lemon">Grow</span></h2>
                    <p className="text-gray-400 text-sm mb-10 max-w-2xl mx-auto font-bold uppercase tracking-tight">
                        Invite fellow owners to the BaBu SAHAB community.
                        <span className="text-lemon"> Get 1 Month Free Subscription</span> for every activation!
                    </p>

                    <div className="bg-lemon/5 p-8 rounded-[2.5rem] inline-block border-2 border-dashed border-lemon/30 backdrop-blur-md mb-8">
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-3">Your Terminal Code</p>
                        <div className="text-4xl md:text-6xl font-mono font-black text-white tracking-widest italic">
                            {user.referralCode || 'BS-X001'}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleCopy}
                            className={`px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                        >
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                        <button 
                            onClick={handleShare}
                            className="bg-lemon text-black px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-lemon-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-lemon/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            Share Link
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { step: "01", title: "Share Link", desc: "Send your unique code to other restaurant owners." },
                        { step: "02", title: "Signup", desc: "They use your code during the registration process." },
                        { step: "03", title: "Reward", desc: "Instantly get 30 days added to your plan for free." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 text-center hover:border-lemon/30 transition-all">
                            <div className="text-4xl font-black text-lemon/20 mb-4 italic">{item.step}</div>
                            <h4 className="text-white font-black uppercase text-sm mb-2 tracking-tighter">{item.title}</h4>
                            <p className="text-gray-500 text-[11px] font-bold uppercase leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
                
                <div className="pt-10 text-center">
                    <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em]">Unlimited Rewards • No Cap on Referrals</p>
                </div>
            </div>
        </div>
    );
};

export default Referral;
