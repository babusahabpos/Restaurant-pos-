import React, { useState } from 'react';
import { EyeOpenIcon, EyeClosedIcon } from './Icons';

interface LoginProps {
    onLogin: (email: string, pass: string) => 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found';
    onNavigateToRegister: () => void;
    onForgotPassword: (identifier: string) => boolean;
}

const ForgotPasswordModal: React.FC<{
    onClose: () => void;
    onSubmit: (identifier: string) => boolean;
}> = ({ onClose, onSubmit }) => {
    const [identifier, setIdentifier] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (identifier) {
            if(onSubmit(identifier)) {
                onClose();
            }
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Forgot Password</h3>
                <p className="text-sm text-gray-400 mb-6">Enter your email or phone number to request a password reset.</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email or Phone Number" 
                        className="w-full bg-gray-900 text-white p-3 rounded mb-6 border border-gray-700 focus:ring-lemon focus:border-lemon"
                        required
                    />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    )
};

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const result = onLogin(email, password);
        
        switch (result) {
            case 'pending':
                setError('Your account is pending approval from the admin.');
                break;
            case 'blocked':
                setError('Your account has been blocked. Please contact support.');
                break;
            case 'not_found':
                setError('Invalid email or password.');
                break;
            case 'ok':
            case 'admin':
                // Success, App component will handle navigation
                break;
        }
    };
    
    return (
        <>
        {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} onSubmit={onForgotPassword} />}
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-black rounded-lg shadow-2xl">
                <div>
                    <h2 className="text-3xl font-extrabold text-center text-lemon">
                        Welcome to BaBu SAHAB
                    </h2>
                    <p className="mt-2 text-sm text-center text-gray-400">
                        Sign in to your restaurant POS
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && <p className="text-sm text-center text-lemon">{error}</p>}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-lemon focus:border-lemon focus:z-10 sm:text-sm"
                                placeholder="Email address"
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

                    <div>
                        <button
                            type="submit"
                            className="relative flex justify-center w-full px-4 py-3 text-sm font-bold text-black bg-lemon border border-transparent rounded-md group hover:bg-lemon-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lemon"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default Login;