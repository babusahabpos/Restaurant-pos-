
import React, { useState, useEffect } from 'react';
import { EyeOpenIcon, EyeClosedIcon } from './Icons';
import { RegisteredUser, UserStatus } from '../types';

interface RegisterProps {
    onRegister: (newUser: Omit<RegisteredUser, 'id' | 'status' | 'lastLogin' | 'subscriptionEndDate' | 'menu' | 'address' | 'deliveryCharge' | 'isDeliveryEnabled' | 'isPrinterEnabled' | 'taxRate' | 'fssai' | 'referralCode' | 'socialMedia'>, status: UserStatus, referralCode?: string) => void;
    onNavigateToLogin: () => void;
}

const RegistrationSuccessModal: React.FC<{ status: UserStatus; onClose: () => void }> = ({ status, onClose }) => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex justify-center items-center z-[100] p-4">
        <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl text-center w-full max-w-md border border-lemon animate-fade-in">
            <div className="w-24 h-24 bg-lemon/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-lemon/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">ID ACTIVATED!</h3>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                Your payment has been received. Welcome to the premium community of <span className="text-lemon font-bold">BaBu SAHAB</span>.
            </p>
            <button onClick={onClose} className="w-full bg-lemon text-black font-black py-5 rounded-2xl hover:bg-lemon-dark transition shadow-xl shadow-lemon/20 uppercase text-xs tracking-[0.2em]">
                Start Billing Now
            </button>
        </div>
    </div>
);

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState({ restaurantName: '', name: '', phone: '', email: '', password: '' });
    const [referralCode, setReferralCode] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const ADMIN_UPI_ID = "7003548323@ybl";
    const SUBSCRIPTION_AMOUNT = "30";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref');
        if (refParam) setReferralCode(refParam);
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.restaurantName || !formData.phone || !formData.email || !formData.password) {
            setError('Please fill all required fields.');
            return;
        }
        setStep(2);
    };

    const upiUrl = `upi://pay?pa=${ADMIN_UPI_ID}&pn=BaBuSAHAB&am=${SUBSCRIPTION_AMOUNT}&cu=INR&tn=BaBuSAHAB_Monthly_30_${formData.restaurantName.replace(/\s/g, '_')}`;

    const handleVerifyAndActivate = (e: React.FormEvent) => {
        e.preventDefault();
        if (transactionId.length < 6) {
            alert("Please enter a valid Transaction ID / UTR.");
            return;
        }

        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            onRegister(formData, UserStatus.Approved, referralCode);
            setShowSuccessModal(true);
        }, 3500);
    };

    if (showSuccessModal) return <RegistrationSuccessModal status={UserStatus.Approved} onClose={onNavigateToLogin} />;

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4 overflow-y-auto">
            <div className="w-full max-w-md p-8 my-8 space-y-6 bg-black rounded-[2.5rem] shadow-2xl border border-gray-800 relative overflow-hidden">
                {isVerifying && (
                    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                        <div className="w-16 h-16 border-4 border-lemon border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-black text-lemon uppercase tracking-widest">Checking Server</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-2">Connecting with Bank Systems...</p>
                    </div>
                )}

                <div className="text-center">
                    <h2 className="text-4xl font-black text-lemon tracking-tighter uppercase italic">BaBu SAHAB</h2>
                    <p className="mt-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
                        {step === 1 ? 'Join the Premium POS' : 'Identity Verification'}
                    </p>
                </div>

                {error && <div className="bg-red-900/20 border border-red-800 p-4 rounded-2xl text-center"><p className="text-[10px] text-red-400 font-black uppercase tracking-widest">{error}</p></div>}

                {step === 1 ? (
                    <form className="space-y-3" onSubmit={handleFormSubmit}>
                        <input type="text" required value={formData.restaurantName} onChange={e => setFormData({...formData, restaurantName: e.target.value})} className="w-full px-4 py-4 text-white bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-lemon font-bold text-sm" placeholder="Restaurant Name"/>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-4 text-white bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-lemon font-bold text-sm" placeholder="Full Name"/>
                        <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-4 text-white bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-lemon font-bold text-sm" placeholder="WhatsApp / Mobile"/>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-4 text-white bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-lemon font-bold text-sm" placeholder="Email Address"/>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-4 text-white bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-lemon font-bold text-sm" placeholder="Password"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 text-gray-500">
                                {showPassword ? <EyeClosedIcon className="w-5 h-5"/> : <EyeOpenIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                        
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] hover:bg-lemon-dark transition shadow-xl shadow-lemon/10 uppercase text-xs tracking-widest mt-4">
                            Proceed to Payment
                        </button>
                        <p className="text-center text-[10px] text-lemon font-black uppercase tracking-widest cursor-pointer mt-4" onClick={onNavigateToLogin}>Log in to existing account</p>
                    </form>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-900 p-6 rounded-3xl border border-lemon/20 text-center shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-lemon text-black text-[8px] px-3 py-1 font-black uppercase tracking-tighter rounded-bl-xl">Special Offer</div>
                            <h4 className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">Monthly Subscription</h4>
                            <div className="flex items-center justify-center gap-3">
                                <p className="text-xl font-black text-gray-600 line-through">₹99</p>
                                <p className="text-4xl font-black text-white">₹30</p>
                            </div>
                            <p className="text-[9px] text-lemon/80 font-bold uppercase mt-2 tracking-widest">Per Month • Active Forever</p>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3">1. Launch Payment App</p>
                                <a 
                                    href={upiUrl}
                                    className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                                >
                                    <div className="flex gap-1.5">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" className="h-4" alt="GPay"/>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-4" alt="UPI"/>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-tighter">Open GPay / PhonePe</span>
                                </a>
                                <p className="text-[8px] text-gray-600 mt-2 font-bold italic uppercase tracking-tighter">* Click button to open UPI apps</p>
                            </div>

                            <form onSubmit={handleVerifyAndActivate} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3 text-center">2. Paste Transaction ID</p>
                                <input 
                                    type="text" 
                                    placeholder="UTR / Order ID from GPay" 
                                    required 
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                    className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-mono font-bold text-center text-sm mb-3"
                                />
                                <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-[11px] tracking-widest">
                                    Verify & Activate
                                </button>
                            </form>
                        </div>

                        <button onClick={() => setStep(1)} className="w-full text-gray-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                             Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
