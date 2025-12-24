
import React, { useState } from 'react';
import { RegisteredUser } from '../types';
import { LogoutIcon } from './Icons';

interface SettingsProps {
    user: RegisteredUser;
    onSave: (updates: Partial<RegisteredUser>) => void;
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onSave, onLogout }) => {
    const [formData, setFormData] = useState({
        restaurantName: user.restaurantName,
        phone: user.phone,
        address: user.address,
        taxRate: user.taxRate || 5,
        deliveryCharge: user.deliveryCharge !== undefined ? user.deliveryCharge : 30,
        isDeliveryEnabled: user.isDeliveryEnabled !== undefined ? user.isDeliveryEnabled : true,
        isPrinterEnabled: user.isPrinterEnabled !== undefined ? user.isPrinterEnabled : true,
        fssai: user.fssai || '',
        instagram: user.socialMedia?.instagram || '',
        facebook: user.socialMedia?.facebook || '',
        autoPostEnabled: user.socialMedia?.autoPostEnabled || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const checked = (e.target as HTMLInputElement).checked;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            taxRate: Number(formData.taxRate),
            deliveryCharge: Number(formData.deliveryCharge),
            socialMedia: {
                instagram: formData.instagram,
                facebook: formData.facebook,
                autoPostEnabled: formData.autoPostEnabled,
            }
        });
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto h-full overflow-y-auto no-scrollbar pb-20">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-4">Restaurant Settings</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase tracking-widest">Restaurant Name</label>
                        <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800 focus:outline-none focus:border-lemon font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase tracking-widest">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800 focus:outline-none focus:border-lemon font-bold" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase tracking-widest">Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800 focus:outline-none focus:border-lemon font-bold" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase tracking-widest">Tax Rate (%)</label>
                        <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} step="0.1" className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800 focus:outline-none focus:border-lemon font-bold" placeholder="5" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase tracking-widest">FSSAI Number</label>
                        <input type="text" name="fssai" value={formData.fssai} onChange={handleChange} className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800 focus:outline-none focus:border-lemon font-bold" placeholder="FSSAI #" />
                    </div>
                </div>
                
                <hr className="border-gray-800" />
                
                <h4 className="text-sm font-black text-white uppercase tracking-widest">System Preferences</h4>
                <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between">
                         <span className="text-[11px] font-bold text-gray-300">Enable Thermal Printer</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isPrinterEnabled" checked={formData.isPrinterEnabled} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lemon"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                         <span className="text-[11px] font-bold text-gray-300">Enable Home Delivery</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isDeliveryEnabled" checked={formData.isDeliveryEnabled} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lemon"></div>
                        </label>
                    </div>
                </div>

                <hr className="border-gray-800" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Social Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase">Instagram</label>
                        <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800" placeholder="@username" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 block mb-2 uppercase">Facebook</label>
                        <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} className="w-full bg-black text-lemon p-3 rounded-lg border border-gray-800" placeholder="facebook.com/page" />
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                    <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-lemon/10">
                        Save All Changes
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => { if(window.confirm('Are you sure you want to logout?')) onLogout(); }}
                        className="w-full bg-red-600/10 text-red-500 border border-red-600/30 font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        Logout From Account
                    </button>
                </div>
                
                <div className="text-center pt-4">
                     <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">BaBu SAHAB POS v2.1.0</p>
                </div>
            </form>
        </div>
    );
};

export default Settings;
