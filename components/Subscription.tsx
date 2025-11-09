import React from 'react';

const Subscription: React.FC = () => {
    return (
        <div className="bg-black p-6 rounded-lg shadow-lg max-w-4xl mx-auto space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lemon"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    Subscription Management
                </h3>
                <p className="text-gray-400">View your current plan details and explore upgrade options.</p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-lg text-lemon">Your Current Plan: Basic Tier</h4>
                        <p className="text-gray-300 mt-1">Access to core POS features, up to 50 daily transactions, and basic reporting.</p>
                    </div>
                    <span className="bg-green-900 text-green-300 text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Active
                    </span>
                </div>
            </div>

            <div className="border-2 border-dashed border-lemon rounded-lg p-6 bg-lemon/10">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h4 className="font-semibold text-lg text-lemon">Upgrade to Premium</h4>
                        <p className="text-lemon/80 mt-1">Unlock unlimited transactions, advanced analytics, inventory alerts, priority support, and more!</p>
                        <p className="text-2xl font-bold text-white mt-2">₹99 / month</p>
                    </div>
                    <button className="w-full md:w-auto bg-lemon text-black font-bold py-2.5 px-6 rounded-lg hover:bg-lemon-dark transition flex items-center justify-center gap-2">
                        Upgrade to Premium
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 13V9m4 4H8"/></svg>
                    </button>
                </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center">Note: This page is a UI placeholder. Subscription management and payment processing require backend integration.</p>
        </div>
    );
};

export default Subscription;