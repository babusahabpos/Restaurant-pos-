import React, { useState, useMemo } from 'react';
import { RegisteredUser } from '../../types';

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

const SubscriptionRenewal: React.FC<{
    users: RegisteredUser[];
    onUpdateSubscription: (userId: number, newDate: string) => void;
}> = ({ users, onUpdateSubscription }) => {
    
    const [managingUser, setManagingUser] = useState<RegisteredUser | null>(null);

    const usersForRenewal = useMemo(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        return users
            .filter(user => new Date(user.subscriptionEndDate) <= sevenDaysFromNow)
            .sort((a, b) => new Date(a.subscriptionEndDate).getTime() - new Date(b.subscriptionEndDate).getTime());
    }, [users]);
    
    const getStatusChip = (endDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const subEndDate = new Date(endDate);
        
        if (subEndDate < today) {
            return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Expired</span>;
        } else {
             return <span className="bg-yellow-800/20 text-yellow-300 text-xs font-medium px-2.5 py-1 rounded-full">Expiring Soon</span>;
        }
    };

    return (
        <>
        {managingUser && <SubscriptionModal user={managingUser} onClose={() => setManagingUser(null)} onSave={onUpdateSubscription} />}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-white">Users for Subscription Renewal</h3>
            </div>
             <div className="overflow-x-auto">
                {usersForRenewal.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Restaurant</th>
                                <th scope="col" className="px-6 py-3">Owner</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Subscription End Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersForRenewal.map(user => (
                                <tr key={user.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.restaurantName}</th>
                                    <td className="px-6 py-4">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 font-semibold">{user.subscriptionEndDate}</td>
                                    <td className="px-6 py-4">{getStatusChip(user.subscriptionEndDate)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setManagingUser(user)} className="font-medium text-lemon hover:underline">Update</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500 py-10">No users have subscriptions expiring soon.</p>
                )}
            </div>
        </div>
        </>
    );
};

export default SubscriptionRenewal;