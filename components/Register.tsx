import React, { useState } from 'react';
import { EyeOpenIcon, EyeClosedIcon } from './Icons';
import { RegisteredUser } from '../types';

interface RegisterProps {
    onRegister: (newUser: Omit<RegisteredUser, 'id' | 'status' | 'lastLogin' | 'subscriptionEndDate'>) => void;
    onNavigateToLogin: () => void;
}

const RegistrationSuccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-black p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Registration Submitted!</h3>
            <p className="text-gray-300 mb-2">
                A confirmation email has been sent to you.
            </p>
            <p className="text-gray-400 text-sm mb-6">
                Please allow up to 24 hours for admin approval. You will receive further instructions for subscription payment once approved.
            </p>
            <button onClick={onClose} className="mt-4 w-full bg-lemon text-black font-bold py-2 px-6 rounded-lg hover:bg-lemon-dark transition">
                Got it!
            </button>
        </div>
    </div>
);

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
    const [restaurantName, setRestaurantName] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!restaurantName || !name || !email || !password || !phone) {
            setError('All fields are required.');
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
             setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        
        onRegister({ restaurantName, name, phone, email, password });
        setShowSuccessModal(true);
    };
    
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onNavigateToLogin();
    };

    return (
        <>
            {showSuccessModal && <RegistrationSuccessModal onClose={handleCloseSuccessModal} />}
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-full max-w-md p-8 space-y-6 bg-black rounded-lg shadow-2xl">
                    <div>
                        <h2 className="text-3xl font-extrabold text-center text-lemon">
                            Create Your Account
                        </h2>
                        <p className="mt-2 text-sm text-center text-gray-400">
                            Get started with BaBu SAHAB POS
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
                        {error && <p className="text-sm text-center text-lemon">{error}</p>}
                        
                        <div className="space-y-4">
                            <input name="restaurantName" type="text" required value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md" placeholder="Restaurant Name"/>
                            <input name="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md" placeholder="Owner Name"/>
                            <input name="phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md" placeholder="Mobile Number"/>
                            <input name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md" placeholder="Email address"/>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="relative block w-full px-3 py-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-md" placeholder="Password"/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-lemon">
                                    {showPassword ? <EyeClosedIcon className="w-5 h-5"/> : <EyeOpenIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                         <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }} className="font-medium text-lemon hover:text-lemon-dark">
                                    Already have an account? Sign in
                                </a>
                            </div>
                        </div>

                        <div>
                             <button type="submit" className="relative flex justify-center w-full px-4 py-3 text-sm font-bold text-black bg-lemon border border-transparent rounded-md group hover:bg-lemon-dark">
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;