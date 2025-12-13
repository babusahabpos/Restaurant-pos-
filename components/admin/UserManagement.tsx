
import React, { useState, useEffect } from 'react';
import { RegisteredUser, UserStatus, MenuItem } from '../../types';

// Helper to get API key safely from various environment configurations
const getApiKey = () => {
    // Try standard process.env (Next.js, Node, Webpack with DefinePlugin)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    // Try Vite standard (import.meta.env)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
    return '';
};

const SendMessageModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSend: (userId: number, message: string) => void;
}> = ({ user, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Send Message to {user.name}</h3>
                <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={() => { onSend(user.id, message); onClose(); }} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Send</button>
                </div>
            </div>
        </div>
    );
};

const PasswordManagerModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, newPass: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    
    const handleSave = () => {
        if (newPassword) {
            onSave(user.id, newPassword);
            onClose();
        } else {
            alert('New password cannot be empty.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Manage Password for {user.name}</h3>
                <div className='space-y-4'>
                    <p className="text-sm text-gray-400">Current Password: <span className="font-mono text-lemon bg-gray-700 px-2 py-1 rounded">{user.password}</span></p>
                    <input 
                        type="text"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-gray-700 text-white p-2 rounded"
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Change Password</button>
                </div>
            </div>
        </div>
    );
};

const SubscriptionModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, newDate: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [date, setDate] = useState(user.subscriptionEndDate);

    const handleSave = () => {
        if (date) {
            onSave(user.id, date);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Update Subscription for {user.name}</h3>
                <div className='space-y-2'>
                    <label className="text-sm text-gray-400">Subscription End Date</label>
                    <input 
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-gray-700 text-white p-2 rounded"
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Update Date</button>
                </div>
            </div>
        </div>
    );
};

const MenuUploadModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, menu: MenuItem[]) => void;
}> = ({ user, onClose, onSave }) => {
    const [menu, setMenu] = useState<MenuItem[]>(user.menu || []);
    const [menuText, setMenuText] = useState('');

    const handleProcessText = () => {
        if (!menuText.trim()) {
            alert("Please paste the menu text first.");
            return;
        }

        const lines = menuText.split('\n');
        const newItems: MenuItem[] = [];
        let count = 0;

        lines.forEach((line: string, index: number) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Regex looks for: Item Name followed by space/dots/dashes then a Number at the end
            // Examples: "Chicken Curry ... 200", "Roti 10", "Dal Fry - 120"
            const match = trimmed.match(/^(.+?)[\s\.\-]+(\d+(\.\d{1,2})?)$/);

            if (match) {
                const name = match[1].trim();
                const price = parseFloat(match[2]);

                if (name && price > 0) {
                    newItems.push({
                        id: Date.now() + index + count,
                        name: name.replace(/[^a-zA-Z0-9\s\(\)]/g, ''), // Clean special chars from name
                        category: 'General', // Default category
                        offlinePrice: price,
                        onlinePrice: price,
                        inStock: true
                    });
                    count++;
                }
            }
        });

        if (newItems.length > 0) {
            setMenu(prev => [...prev, ...newItems]);
            setMenuText('');
            alert(`Successfully added ${newItems.length} items from text!`);
        } else {
            alert("Could not find any items. Ensure format is 'Item Name ... Price' on each line.");
        }
    };
    
    const handleDeleteItem = (id: number) => {
        if(confirm("Are you sure you want to delete this item?")) {
            setMenu(menu.filter(m => m.id !== id));
        }
    }

    const handleSaveAll = () => {
        onSave(user.id, menu);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-semibold text-white">Manage Menu for {user.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 overflow-hidden h-full">
                    {/* Text Input Section */}
                    <div className="w-full md:w-1/2 bg-gray-900 p-4 rounded-lg flex flex-col gap-4">
                        <div>
                            <h4 className="text-lemon font-bold mb-2">Paste Menu Text</h4>
                            <p className="text-xs text-gray-400 mb-2">
                                Paste the full menu here. Each line should have an item name and price.<br/>
                                <em>Example: Chicken Biryani 250</em>
                            </p>
                            <textarea 
                                value={menuText}
                                onChange={e => setMenuText(e.target.value)}
                                placeholder="Paste menu here..."
                                className="w-full h-64 bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-lemon outline-none font-mono text-sm"
                            />
                            <button 
                                onClick={handleProcessText}
                                className="mt-3 w-full bg-lemon text-black font-bold py-2 rounded hover:bg-lemon-dark"
                            >
                                Process & Add Items
                            </button>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div className="w-full md:w-1/2 bg-gray-900 p-4 rounded-lg overflow-y-auto">
                        <h4 className="text-white font-bold mb-4 sticky top-0 bg-gray-900 pb-2 border-b border-gray-800">
                            Current Menu Items ({menu.length})
                        </h4>
                        <div className="space-y-2">
                            {menu.length === 0 ? <p className="text-gray-500 text-center mt-10">No items yet.</p> : 
                             menu.slice().reverse().map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-800 p-2 rounded border border-gray-700">
                                    <div>
                                        <p className="text-white font-semibold text-sm">{item.name}</p>
                                        <p className="text-gray-400 text-xs">₹{item.offlinePrice}</p>
                                    </div>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300 px-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-6 rounded hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSaveAll} className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700">Save All Changes</button>
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC<{
    users: RegisteredUser[];
    onBlockUser: (userId: number, shouldBlock: boolean) => void;
    onSendMessage: (userId: number | 'all', message: string) => void;
    onPasswordChange: (userId: number, newPass: string) => void;
    onUpdateSubscription: (userId: number, newDate: string) => void;
    onUpdateMenu: (userId: number, menu: MenuItem[]) => void;
    onDeleteUser: (userId: number) => void;
}> = ({ users, onBlockUser, onSendMessage, onPasswordChange, onUpdateSubscription, onUpdateMenu, onDeleteUser }) => {
    
    const [messagingUser, setMessagingUser] = useState<RegisteredUser | null>(null);
    const [passwordUser, setPasswordUser] = useState<RegisteredUser | null>(null);
    const [subscriptionUser, setSubscriptionUser] = useState<RegisteredUser | null>(null);
    const [menuUser, setMenuUser] = useState<RegisteredUser | null>(null);

     const getStatusChip = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Approved: return <span className="bg-green-800 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">Approved</span>;
            case UserStatus.Pending: return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Pending</span>;
            case UserStatus.Rejected: return <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">Rejected</span>;
            case UserStatus.Blocked: return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Blocked</span>;
            case UserStatus.Deleted: return <span className="bg-red-900 text-red-300 text-xs font-medium px-2.5 py-1 rounded-full">Deleted</span>;
        }
    };

    const getReferrerName = (code: string | undefined) => {
        if (!code) return '-';
        const referrer = users.find(u => u.referralCode === code);
        return referrer ? `${referrer.restaurantName} (${referrer.name})` : code;
    };

    const handleDeleteClick = (userId: number) => {
        if (confirm("Are you sure you want to delete this user? The user will not be able to login.")) {
            onDeleteUser(userId);
        }
    };

    return (
        <>
        {messagingUser && <SendMessageModal user={messagingUser} onClose={() => setMessagingUser(null)} onSend={onSendMessage} />}
        {passwordUser && <PasswordManagerModal user={passwordUser} onClose={() => setPasswordUser(null)} onSave={onPasswordChange} />}
        {subscriptionUser && <SubscriptionModal user={subscriptionUser} onClose={() => setSubscriptionUser(null)} onSave={onUpdateSubscription} />}
        {menuUser && <MenuUploadModal user={menuUser} onClose={() => setMenuUser(null)} onSave={onUpdateMenu} />}

        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-white">User Management</h3>
                 <input type="text" placeholder="Search users..." className="w-full md:w-1/2 bg-gray-800 text-white p-2 rounded-lg border border-gray-700" />
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Restaurant</th>
                            <th scope="col" className="px-6 py-3">Owner</th>
                            <th scope="col" className="px-6 py-3">Referred By</th>
                            <th scope="col" className="px-6 py-3">Subscription End</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.restaurantName}</th>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4 text-lemon">{getReferrerName(user.referredBy)}</td>
                                <td className="px-6 py-4">{user.subscriptionEndDate}</td>
                                <td className="px-6 py-4">{getStatusChip(user.status)}</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    {user.status !== UserStatus.Deleted && (
                                        <>
                                            {user.status === UserStatus.Approved && <button onClick={() => onBlockUser(user.id, true)} className="font-medium text-lemon hover:underline">Block</button>}
                                            {user.status === UserStatus.Blocked && <button onClick={() => onBlockUser(user.id, false)} className="font-medium text-green-500 hover:underline">Unblock</button>}
                                            <button onClick={() => setMessagingUser(user)} className="font-medium text-blue-500 hover:underline">Message</button>
                                            <button onClick={() => setPasswordUser(user)} className="font-medium text-lemon hover:underline">Password</button>
                                            <button onClick={() => setSubscriptionUser(user)} className="font-medium text-teal-500 hover:underline">Subscription</button>
                                            <button onClick={() => setMenuUser(user)} className="font-medium text-yellow-500 hover:underline">Menu Upload</button>
                                            <button onClick={() => handleDeleteClick(user.id)} className="font-medium text-red-500 hover:underline">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default UserManagement;
