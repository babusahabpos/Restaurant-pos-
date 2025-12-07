
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
        // Updated URL to include the ref query parameter
        const shareUrl = `${window.location.origin}?ref=${user.referralCode}`;

        const shareData = {
            title: 'BaBu SAHAB POS - Join Now!',
            text: `Use my referral code ${user.referralCode} to join BaBu SAHAB POS and manage your restaurant efficiently!`,
            url: shareUrl
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => console.error('Error sharing', err));
        } else {
            // Fallback: Copy the full URL with ref code
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            alert('Sharing link copied to clipboard!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-lemon"></div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Refer & Earn <span className="text-lemon">Free Subscription</span></h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                    Invite other restaurant owners to BaBu SAHAB POS. When they register using your code, 
                    <span className="text-lemon font-bold"> you get 1 Month Free Subscription</span> added to your plan!
                </p>

                <div className="bg-gray-800/50 p-6 rounded-xl inline-block border-2 border-dashed border-lemon/50 backdrop-blur-sm">
                    <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Your Unique Referral Code</p>
                    <div className="text-3xl md:text-5xl font-mono font-bold text-white tracking-wider">
                        {user.referralCode || 'NOT-AVAILABLE'}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <button 
                        onClick={handleCopy}
                        className={`px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${copied ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                        {copied ? 'Code Copied!' : 'Copy Code'}
                    </button>
                    <button 
                        onClick={handleShare}
                        className="bg-lemon text-black px-8 py-3 rounded-lg font-bold hover:bg-lemon-dark transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        Share Link
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-center">
                    <div className="w-12 h-12 bg-lemon rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">1</div>
                    <h4 className="text-white font-bold mb-2">Share Link</h4>
                    <p className="text-gray-400 text-sm">Send your unique link to fellow restaurant owners.</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-center">
                    <div className="w-12 h-12 bg-lemon rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">2</div>
                    <h4 className="text-white font-bold mb-2">They Register</h4>
                    <p className="text-gray-400 text-sm">The code is automatically added when they sign up.</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-center">
                    <div className="w-12 h-12 bg-lemon rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">3</div>
                    <h4 className="text-white font-bold mb-2">You Earn</h4>
                    <p className="text-gray-400 text-sm">You instantly get +30 Days validity on your subscription.</p>
                </div>
            </div>
        </div>
    );
};

export default Referral;
