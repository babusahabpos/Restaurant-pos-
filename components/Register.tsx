
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { EyeOpenIcon, EyeClosedIcon } from './Icons';
import { RegisteredUser, UserStatus } from '../types';
import { MOCK_MENU_ITEMS } from '../constants';

interface RegisterProps {
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
                Your account is now ready. Welcome to the premium community of <span className="text-lemon font-bold">BaBu SAHAB</span>.
            </p>
            <button onClick={onClose} className="w-full bg-lemon text-black font-black py-5 rounded-2xl hover:bg-lemon-dark transition shadow-xl shadow-lemon/20 uppercase text-xs tracking-[0.2em]">
                Start Billing Now
            </button>
        </div>
    </div>
);

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState({ restaurantName: '', name: '', phone: '', email: '', password: '' });
    const [referralCode, setReferralCode] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const SUBSCRIPTION_AMOUNT = "99"; 
    const UPI_PAYMENT_URL = "upi://pay?pa=gpay-11257286267@okbizaxis&pn=BaBu%20SAHAB%20POS&am=99&cu=INR";

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

    const handlePayClick = () => {
        window.location.href = UPI_PAYMENT_URL;
    };

    const handleVerifyAndActivate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (transactionId.length < 4) {
            alert("Please enter a valid Transaction ID / UTR.");
            return;
        }

        if (!formData.email.includes('@')) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsVerifying(true);
        setError('');
        
        try {
            // Sign out any existing user first to avoid conflicts
            if (auth.currentUser) {
                await signOut(auth);
            }

            console.log("Attempting registration for:", formData.email);
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            console.log("Auth user created:", user.uid);

            // 2. Create User Profile in Realtime Database
            const uid = user.uid;
            const newUser: RegisteredUser = {
                ...formData,
                id: uid,
                status: UserStatus.Approved,
                subscriptionEndDate: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0],
                menu: MOCK_MENU_ITEMS,
                address: '',
                taxRate: 5,
                deliveryCharge: 30,
                isDeliveryEnabled: true,
                isPrinterEnabled: true,
                referralCode: referralCode || 'REF' + uid,
                lastLogin: new Date().toISOString()
            };

            console.log("Writing to database path:", `global/users/${uid}`);
            await set(ref(db, `global/users/${uid}`), newUser);
            console.log("Database write successful");
            
            setIsVerifying(false);
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error("Registration error:", err.code, err.message);
            setIsVerifying(false);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please try logging in.");
            } else {
                setError(err.message);
            }
        }
    };

    if (showSuccessModal) return <RegistrationSuccessModal status={UserStatus.Approved} onClose={() => window.location.reload()} />;

    return (
        <div className="flex items-center justify-center min-h-screen bg-lemon p-4 overflow-y-auto">
            <div className="w-full max-w-md p-8 my-8 space-y-6 bg-black rounded-[2.5rem] shadow-2xl border border-gray-800 relative overflow-hidden">
                {isVerifying && (
                    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                        <div className="w-16 h-16 border-4 border-lemon border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-black text-lemon uppercase tracking-widest">Processing</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-2">Communicating with Server...</p>
                    </div>
                )}

                <div className="text-center">
                    <h2 className="text-4xl font-black text-lemon tracking-tighter uppercase italic leading-none">BaBu SAHAB</h2>
                    <p className="mt-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
                        {step === 1 ? 'Join the Premium POS' : 'Identity Verification'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${auth ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">
                            Firebase {auth ? 'Online' : 'Offline'}
                        </span>
                    </div>
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
                        
                        <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] hover:bg-lemon-dark transition shadow-xl shadow-lemon/20 uppercase text-xs tracking-widest mt-4">
                            Proceed to Identity
                        </button>
                        <p className="text-center text-[10px] text-lemon font-black uppercase tracking-widest cursor-pointer mt-4" onClick={onNavigateToLogin}>Log in to existing account</p>
                    </form>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {/* RESTORED PLAN DETAILS BOX STYLE */}
                        <div className="p-6 rounded-[2rem] border-2 border-lemon bg-lemon/5 shadow-2xl">
                            <h3 className="text-lemon font-black text-sm uppercase tracking-tighter italic">Activation Plan</h3>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-white font-black text-base uppercase">Subscription</p>
                                    <p className="text-lemon font-black text-base">₹99 / Monthly</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                    <div className="flex flex-col">
                                        <p className="text-green-500 font-black text-[11px] uppercase tracking-widest leading-none">Joining Bonus</p>
                                        <p className="text-gray-500 font-bold text-[8px] uppercase tracking-widest mt-1 opacity-60">Valid for 60 Days Total</p>
                                    </div>
                                    <p className="text-green-500 font-black text-[11px] uppercase tracking-widest">+ 1 Month FREE</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* LARGE LEMON YELLOW BUTTON */}
                            <button 
                                onClick={handlePayClick}
                                className="w-full bg-lemon hover:bg-lemon-dark text-black font-black p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,0,0.15)] group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mb-1"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                                <span className="text-sm font-black uppercase tracking-widest">PAY NOW</span>
                                <span className="text-[8px] font-bold uppercase opacity-60">Opens GPay / PhonePe / Paytm</span>
                            </button>

                            <div className="bg-lemon/10 border border-lemon/20 p-4 rounded-2xl text-center">
                                <p className="text-[10px] text-lemon font-black uppercase tracking-widest leading-relaxed">
                                    payment ar somoy add note a restaurant name share korun
                                </p>
                            </div>

                            <form onSubmit={handleVerifyAndActivate} className="bg-gray-900/40 p-5 rounded-[2.5rem] border border-gray-800">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3 text-center">After Payment, Enter UTR / Ref No.</p>
                                <input 
                                    type="text" 
                                    placeholder="UTR / Transaction ID" 
                                    required 
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                    className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-mono font-bold text-center text-sm mb-4 focus:border-lemon transition-colors"
                                />
                                <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-[11px] tracking-widest">
                                    Verify & Activate Terminal
                                </button>
                            </form>
                        </div>

                        <button onClick={() => setStep(1)} className="w-full text-gray-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 pt-4">
                             ← Edit Registration Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
