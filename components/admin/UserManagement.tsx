
import React, { useState } from 'react';
import { RegisteredUser, UserStatus } from '../../types';

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

const UserManagement: React.FC<{
    users: RegisteredUser[];
    onBlockUser: (userId: number, shouldBlock: boolean) => void;
    onSendMessage: (userId: number | 'all', message: string) => void;
    onPasswordChange: (userId: number, newPass: string) => void;
    onUpdateSubscription: (userId: number, newDate: string) => void;
}> = ({ users, onBlockUser, onSendMessage, onPasswordChange, onUpdateSubscription }) => {
    
    const [messagingUser, setMessagingUser] = useState<RegisteredUser | null>(null);
    const [passwordUser, setPasswordUser] = useState<RegisteredUser | null>(null);
    const [subscriptionUser, setSubscriptionUser] = useState<RegisteredUser | null>(null);

     const getStatusChip = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Approved: return <span className="bg-green-800 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">Approved</span>;
            case UserStatus.Pending: return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Pending</span>;
            case UserStatus.Rejected: return <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">Rejected</span>;
            case UserStatus.Blocked: return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Blocked</span>;
        }
    };

    // Helper to find name from code
    const getReferrerName = (code: string | undefined) => {
        if (!code) return '-';
        const referrer = users.find(u => u.referralCode === code);
        return referrer ? `${referrer.restaurantName} (${referrer.name})` : code;
    };

    return (
        <>
        {messagingUser && <SendMessageModal user={messagingUser} onClose={() => setMessagingUser(null)} onSend={onSendMessage} />}
        {passwordUser && <PasswordManagerModal user={passwordUser} onClose={() => setPasswordUser(null)} onSave={onPasswordChange} />}
        {subscriptionUser && <SubscriptionModal user={subscriptionUser} onClose={() => setSubscriptionUser(null)} onSave={onUpdateSubscription} />}
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
                                    {user.status === UserStatus.Approved && <button onClick={() => onBlockUser(user.id, true)} className="font-medium text-lemon hover:underline">Block</button>}
                                    {user.status === UserStatus.Blocked && <button onClick={() => onBlockUser(user.id, false)} className="font-medium text-green-500 hover:underline">Unblock</button>}
                                    <button onClick={() => setMessagingUser(user)} className="font-medium text-blue-500 hover:underline">Message</button>
                                    <button onClick={() => setPasswordUser(user)} className="font-medium text-lemon hover:underline">Password</button>
                                    <button onClick={() => setSubscriptionUser(user)} className="font-medium text-teal-500 hover:underline">Subscription</button>
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
