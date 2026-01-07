
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
    const [paymentMethod, setPaymentMethod] = useState<'selection' | 'upi' | 'qr' | 'whatsapp'>('selection');
    
    const ADMIN_UPI_ID = "7003548323@ybl";
    const SUBSCRIPTION_AMOUNT = "1"; 
    const ADMIN_WHATSAPP = "917003548323"; // Dummy admin number

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

    const upiUrl = `upi://pay?pa=${ADMIN_UPI_ID}&pn=BaBuSAHAB&am=${SUBSCRIPTION_AMOUNT}&cu=INR&tn=ID_Activation`;

    const handlePayNow = () => {
        window.location.href = upiUrl;
    };

    const copyUpiId = () => {
        navigator.clipboard.writeText(ADMIN_UPI_ID);
        alert("UPI ID Copied: " + ADMIN_UPI_ID);
    };

    const handleVerifyAndActivate = (e: React.FormEvent) => {
        e.preventDefault();
        if (transactionId.length < 4) {
            alert("Please enter a valid Transaction ID / UTR.");
            return;
        }

        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            onRegister(formData, UserStatus.Approved, referralCode);
            setShowSuccessModal(true);
        }, 3000);
    };

    if (showSuccessModal) return <RegistrationSuccessModal status={UserStatus.Approved} onClose={onNavigateToLogin} />;

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4 overflow-y-auto">
            <div className="w-full max-w-md p-8 my-8 space-y-6 bg-black rounded-[2.5rem] shadow-2xl border border-gray-800 relative overflow-hidden">
                {isVerifying && (
                    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                        <div className="w-16 h-16 border-4 border-lemon border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-black text-lemon uppercase tracking-widest">Checking Server</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-2">Verifying Transaction...</p>
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
                    <div className="space-y-4 animate-fade-in">
                        {paymentMethod === 'selection' && (
                            <div className="space-y-4">
                                <div className="bg-lemon text-black py-2.5 rounded-xl text-center font-black uppercase tracking-[0.2em] text-[10px]">
                                    CHOOSE PAYMENT METHOD
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    <button onClick={() => setPaymentMethod('upi')} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-lemon transition-all group">
                                        <div className="bg-lemon/10 p-2 rounded-lg group-hover:bg-lemon/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFF00" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-black text-xs uppercase">Pay via UPI Apps</p>
                                            <p className="text-gray-500 text-[9px] font-bold uppercase">GPay, PhonePe, Paytm</p>
                                        </div>
                                    </button>

                                    <button onClick={() => setPaymentMethod('qr')} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-lemon transition-all group">
                                        <div className="bg-lemon/10 p-2 rounded-lg group-hover:bg-lemon/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFF00" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-black text-xs uppercase">Scan QR Code</p>
                                            <p className="text-gray-500 text-[9px] font-bold uppercase">Pay from another phone</p>
                                        </div>
                                    </button>

                                    <button onClick={() => window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=Hi, I want to activate my BaBu SAHAB POS ID. My restaurant is ${formData.restaurantName}.`, '_blank')} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-green-500 transition-all group">
                                        <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 1 1 0 0 1 1 1c0 1.1.9 2 2 2a1 1 0 0 1 1 1v.7c0 .5.4.9.9.9.5 0 .9.4.9.9z"/></svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-black text-xs uppercase">WhatsApp Payment</p>
                                            <p className="text-gray-500 text-[9px] font-bold uppercase">Talk to Admin directly</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'upi' && (
                            <div className="bg-gray-900 p-6 rounded-3xl border border-lemon/20 text-center space-y-4">
                                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Instant Activation</h4>
                                <p className="text-4xl font-black text-white">₹1</p>
                                <button onClick={handlePayNow} className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 shadow-xl border-2 border-white">
                                    <span className="text-[11px] uppercase tracking-tighter">Open UPI App Now</span>
                                </button>
                                <button onClick={() => setPaymentMethod('selection')} className="text-[9px] text-lemon font-black uppercase tracking-widest">Change Method</button>
                            </div>
                        )}

                        {paymentMethod === 'qr' && (
                            <div className="bg-gray-900 p-6 rounded-3xl border border-lemon/20 text-center space-y-4">
                                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Scan to Pay</h4>
                                <div className="bg-white p-2 rounded-xl inline-block">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`} alt="Payment QR" className="w-32 h-32" />
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">Scan with any UPI App</p>
                                <button onClick={() => setPaymentMethod('selection')} className="text-[9px] text-lemon font-black uppercase tracking-widest">Change Method</button>
                            </div>
                        )}

                        <form onSubmit={handleVerifyAndActivate} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-3 text-center">Enter Transaction ID / UTR</p>
                            <input 
                                type="text" 
                                placeholder="UTR / Order ID / Ref No." 
                                required 
                                value={transactionId}
                                onChange={e => setTransactionId(e.target.value)}
                                className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-mono font-bold text-center text-sm mb-3 focus:border-lemon transition-colors"
                            />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-[11px] tracking-widest shadow-lemon/10">
                                Verify & Activate
                            </button>
                        </form>

                        <button onClick={() => setStep(1)} className="w-full text-gray-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                             ← Change Registration Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
