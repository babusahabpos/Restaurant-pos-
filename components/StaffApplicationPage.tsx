
import React, { useState } from 'react';
import { StaffApplication } from '../types';

interface StaffApplicationPageProps {
    onApply: (application: StaffApplication) => void;
}

const StaffApplicationPage: React.FC<StaffApplicationPageProps> = ({ onApply }) => {
    const [formData, setFormData] = useState({
        staffName: '',
        category: '',
        phone: '',
        location: '',
        cvDetails: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const application: StaffApplication = {
            ...formData,
            id: Date.now(),
            timestamp: new Date(),
            isRead: false
        };

        // Call the parent handler for real-time update in the current session
        onApply(application);
        
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
                <div className="bg-gray-900 border border-lemon p-10 rounded-3xl text-center shadow-2xl max-w-md animate-fade-in">
                    <div className="w-20 h-20 bg-lemon rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Application Sent!</h2>
                    <p className="text-gray-400 font-bold">Your details have been sent to BaBu SAHAB Admin. We will contact you if your profile matches a requirement.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center text-white font-sans">
             <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-lemon uppercase tracking-tighter">Staff Registry</h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Upload your details for restaurant jobs</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-5">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Full Name</label>
                        <input 
                            required
                            placeholder="John Doe" 
                            className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none focus:border-lemon transition-all font-bold"
                            value={formData.staffName}
                            onChange={e => setFormData({...formData, staffName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Job Category</label>
                        <select 
                            required
                            className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none focus:border-lemon transition-all font-bold appearance-none"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="">Select Category</option>
                            <option value="Head Chef">Head Chef</option>
                            <option value="Assistant Chef">Assistant Chef</option>
                            <option value="Waiter/Waitress">Waiter/Waitress</option>
                            <option value="Kitchen Helper">Kitchen Helper</option>
                            <option value="Manager">Manager</option>
                            <option value="Delivery Boy">Delivery Boy</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Mobile Number</label>
                            <input 
                                required
                                type="tel"
                                placeholder="9876543210" 
                                className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none focus:border-lemon transition-all font-bold"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Location</label>
                            <input 
                                required
                                placeholder="Kolkata, WB" 
                                className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none focus:border-lemon transition-all font-bold"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">CV Summary / Experience</label>
                        <textarea 
                            required
                            placeholder="Briefly describe your work experience..." 
                            className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none focus:border-lemon transition-all font-bold h-32"
                            value={formData.cvDetails}
                            onChange={e => setFormData({...formData, cvDetails: e.target.value})}
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-lemon/10 active:scale-95 transition-all">
                    Submit Application
                </button>
                <p className="text-center text-[9px] text-gray-600 font-bold uppercase italic">By submitting, you agree to share your details with our partner restaurants.</p>
            </form>
        </div>
    );
};

export default StaffApplicationPage;
