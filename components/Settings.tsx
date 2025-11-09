import React from 'react';

const Settings: React.FC = () => {
    return (
        <div className="bg-black p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Restaurant Settings</h3>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Restaurant Name</label>
                        <input type="text" defaultValue="BaBu SAHAB Restaurant" className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-lemon" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Phone Number</label>
                        <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-lemon" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-400 block mb-2">Address</label>
                    <textarea defaultValue="123 Food Street, Culinary City, 400001" rows={3} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-lemon" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">GSTIN</label>
                        <input type="text" defaultValue="27ABCDE1234F1Z5" className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-lemon" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">FSSAI Number</label>
                        <input type="text" defaultValue="10012345678901" className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-lemon" />
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-bold text-gray-400 block mb-2">"Thank You" Message on Bill</label>
                    <input type="text" defaultValue="Thank you for dining with us! Visit again!" className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-lemon" />
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