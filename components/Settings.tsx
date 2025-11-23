import React, { useState } from 'react';
import { RegisteredUser } from '../types';

interface SettingsProps {
    user: RegisteredUser;
    onSave: (updates: Partial<RegisteredUser>) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        restaurantName: user.restaurantName,
        phone: user.phone,
        address: user.address,
        taxRate: user.taxRate || 5,
        deliveryCharge: user.deliveryCharge !== undefined ? user.deliveryCharge : 30,
        isDeliveryEnabled: user.isDeliveryEnabled !== undefined ? user.isDeliveryEnabled : true,
        fssai: user.fssai || '',
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
        });
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Restaurant Settings</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Restaurant Name</label>
                        <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-400 block mb-2">Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Tax Rate (%)</label>
                        <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} step="0.1" className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" placeholder="5" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">FSSAI Number</label>
                        <input type="text" name="fssai" value={formData.fssai} onChange={handleChange} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" placeholder="Enter FSSAI Number" />
                    </div>
                </div>
                
                <hr className="border-gray-800" />
                <h4 className="text-lg font-bold text-white">Delivery Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Delivery Charge (₹)</label>
                        <input type="number" name="deliveryCharge" value={formData.deliveryCharge} onChange={handleChange} className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" placeholder="0" />
                    </div>
                     <div className="flex items-center mt-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="isDeliveryEnabled" 
                                checked={formData.isDeliveryEnabled} 
                                onChange={handleChange} 
                                className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lemon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-lemon"></div>
                            <span className="ml-3 text-sm font-medium text-white">Enable Home Delivery</span>
                        </label>
                    </div>
                </div>

                 <hr className="border-gray-800" />
                 <div>
                    <label className="text-sm font-bold text-gray-400 block mb-2">"Thank You" Message on Bill</label>
                    <input type="text" defaultValue="Thank you for dining with us! Visit again!" className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-lemon text-black font-bold py-2 px-6 rounded-lg hover:bg-lemon-dark transition">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;