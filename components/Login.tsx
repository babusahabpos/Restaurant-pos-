
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { EyeOpenIcon, EyeClosedIcon } from './Icons';

interface LoginProps {
    onNavigateToRegister: () => void;
}

const ForgotPasswordModal: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (identifier) {
            setLoading(true);
            try {
                await sendPasswordResetEmail(auth, identifier);
                alert("Password reset email sent!");
                onClose();
            } catch (error: any) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Forgot Password</h3>
                <p className="text-sm text-gray-400 mb-6">Enter your email to request a password reset.</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email Address" 
                        className="w-full bg-gray-900 text-white p-3 rounded mb-6 border border-gray-700 focus:ring-lemon focus:border-lemon"
                        required
                    />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark disabled:opacity-50">
                            {loading ? 'Sending...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

const ContactAdminModal: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This would normally send to a backend or DB
        onClose();
        alert("Message sent to Admin successfully.");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-md:max-w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Contact Admin</h3>
                <p className="text-gray-400 text-sm mb-4">Send a message to the administrator regarding your account.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email or Phone" 
                        className="w-full bg-black text-white p-3 rounded border border-gray-700 focus:border-lemon outline-none"
                        required
                    />
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message (e.g., Recover deleted account)" 
                        rows={4}
                        className="w-full bg-black text-white p-3 rounded border border-gray-700 focus:border-lemon outline-none"
                        required
                    />
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="text-gray-400 font-bold hover:text-white px-4">Cancel</button>
                        <button type="submit" className="bg-lemon text-black font-bold py-2 px-6 rounded-lg hover:bg-lemon-dark">Send Message</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            console.log("Attempting login for:", email);
            // Basic email validation
            if (!email.includes('@')) {
                throw new Error("Please enter a valid email address. Mobile number login is not supported yet.");
            }
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful");
        } catch (err: any) {
            console.error("Login error:", err.code, err.message);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please make sure you are using the email you registered with.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
        {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
        {showContactModal && <ContactAdminModal onClose={() => setShowContactModal(false)} />}
        
        <div className="flex items-center justify-center min-h-screen bg-lemon">
            <div className="w-full max-w-md p-8 space-y-8 bg-black rounded-lg shadow-2xl relative">
                <div>
                    <h2 className="text-3xl font-extrabold text-center text-lemon">
                        Welcome to BaBu SAHAB
                    </h2>
                    <p className="mt-2 text-sm text-center text-gray-400">
                        Sign in to your restaurant POS
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${auth ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                            Firebase {auth ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 p-3 rounded text-center">
                            <p className="text-sm text-red-200 font-bold">{error}</p>
                            {(error.includes('blocked') || error.includes('deleted')) && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowContactModal(true)} 
                                    className="text-xs text-lemon underline mt-1 hover:text-white"
                                >
                                    Contact Admin
                                </button>
                            )}
                        </div>
                    )}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-lemon focus:border-lemon focus:z-10 sm:text-sm"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-lemon focus:border-lemon focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-lemon"
                            >
                                {showPassword ? <EyeClosedIcon className="w-5 h-5"/> : <EyeOpenIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                         <div className="text-sm">
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }} className="font-medium text-gray-400 hover:text-lemon">
                                Forgot Password?
                            </a>
                        </div>
                        <div className="text-sm">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }} className="font-medium text-lemon hover:text-lemon-dark">
                                Don't have an account? Register
                            </a>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative flex justify-center w-full px-4 py-3 text-sm font-bold text-black bg-lemon border border-transparent rounded-md group hover:bg-lemon-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lemon disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setShowContactModal(true)}
                            className="w-full text-xs text-gray-500 hover:text-gray-300"
                        >
                            Need Help? Contact Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default Login;
