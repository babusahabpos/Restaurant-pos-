
import React from 'react';

const Subscription: React.FC = () => {
    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lemon"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    Account Status
                </h3>
                <p className="text-gray-400">Manage your monthly subscription and plan details.</p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-lg text-lemon">Standard Premium Monthly</h4>
                        <p className="text-gray-300 mt-1">Full access to Billing, QR Menu, and Reports hub.</p>
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
                        <h4 className="font-semibold text-lg text-lemon">Current Pricing Offer</h4>
                        <p className="text-lemon/80 mt-1">Unlimited transactions and multi-marketplace support included.</p>
                        <p className="text-2xl font-bold text-white mt-2">₹30 / month</p>
                    </div>
                </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center uppercase tracking-widest opacity-50">Support: diptifoodice@gmail.com</p>
        </div>
    );
};

export default Subscription;
