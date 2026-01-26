
import React, { useState } from 'react';
import { RegisteredUser, UserStatus, MenuItem } from '../../types';

const EditProfileModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, name: string, email: string, phone: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
            <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-800">
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tighter text-center">Edit Terminal Profile</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 font-black uppercase mb-1 block">Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black text-white p-3 rounded-xl border border-gray-800 outline-none font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-black uppercase mb-1 block">Email Address</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-black uppercase mb-1 block">Mobile Number</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none font-bold" />
                    </div>
                </div>
                <div className="flex gap-2 mt-8">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl text-[10px] uppercase">Cancel</button>
                    <button onClick={() => { onSave(user.id, name, email, phone); onClose(); }} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/10">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const SendMessageModal: React.FC<{
    user: RegisteredUser | 'all';
    onClose: () => void;
    onSend: (userId: number | 'all', message: string) => void;
}> = ({ user, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
            <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-800">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">
                    {user === 'all' ? 'Broadcast Message' : `Message to ${user.restaurantName}`}
                </h3>
                {user === 'all' && <p className="text-red-400 text-[10px] font-black mb-4 uppercase tracking-widest">This will appear as a red NOTICE on every user's dashboard.</p>}
                <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none focus:border-lemon font-bold text-sm"
                />
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-800 text-white font-black py-3 px-6 rounded-xl text-[10px] uppercase">Cancel</button>
                    <button type="button" onClick={() => { onSend(user === 'all' ? 'all' : user.id, message); onClose(); }} className="bg-lemon text-black font-black py-3 px-8 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/20">Send Now</button>
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
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] p-4">
            <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-gray-800 text-center">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter">Manage Password</h3>
                <div className='space-y-4'>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Current for {user.restaurantName}:</p>
                    <p className="font-mono text-lemon bg-black py-2 px-4 rounded-lg inline-block border border-gray-800">{user.password}</p>
                    <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter New Password" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none text-center font-bold" />
                </div>
                <div className="flex gap-2 mt-8">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl text-[10px] uppercase">Back</button>
                    <button onClick={() => { if(newPassword) { onSave(user.id, newPassword); onClose(); } }} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/10">Update</button>
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
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] p-4">
            <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-gray-800">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter text-center">Set Expiry Date</h3>
                <div className='space-y-4'>
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block text-center">New Subscription End Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold text-center" />
                </div>
                <div className="flex gap-2 mt-8">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl text-[10px] uppercase">Cancel</button>
                    <button onClick={() => { if(date) { onSave(user.id, date); onClose(); } }} className="flex-1 bg-teal-600 text-white font-black py-4 rounded-xl text-[10px] uppercase">Update Validity</button>
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
    const [uploadMode, setUploadMode] = useState<'offline' | 'online'>('offline');

    const handleProcessText = () => {
        const lines = menuText.split('\n');
        let updatedMenu = [...menu];
        
        lines.forEach((line: string, index: number) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const match = trimmed.match(/^(.+?)[\s\.\-]+(\d+(\.\d{1,2})?)$/);
            if (match) {
                const itemName = match[1].trim().toUpperCase();
                const itemPrice = parseFloat(match[2]);
                const existingIndex = updatedMenu.findIndex(m => m.name.toUpperCase() === itemName);
                if (existingIndex > -1) {
                    if (uploadMode === 'offline') updatedMenu[existingIndex].offlinePrice = itemPrice;
                    else updatedMenu[existingIndex].onlinePrice = itemPrice;
                } else {
                    updatedMenu.push({ 
                        id: Date.now() + index + Math.random(), 
                        name: itemName, 
                        category: 'IMPORTED', 
                        offlinePrice: itemPrice,
                        onlinePrice: itemPrice,
                        inStock: true 
                    });
                }
            }
        });
        setMenu(updatedMenu);
        setMenuText('');
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex justify-center items-center z-[250] p-4">
            <div className="bg-gray-900 p-8 rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-gray-800">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Menu Terminal: {user.restaurantName}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl font-black">&times;</button>
                </div>
                <div className="flex flex-col md:flex-row gap-8 overflow-hidden flex-1">
                    <div className="flex-1 bg-black p-6 rounded-[2rem] border border-gray-800 flex flex-col gap-4">
                        <div className="flex gap-2 mb-2 p-1 bg-gray-900 rounded-xl border border-gray-800">
                            <button onClick={() => setUploadMode('offline')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${uploadMode === 'offline' ? 'bg-lemon text-black' : 'text-gray-500'}`}>Offline Menu</button>
                            <button onClick={() => setUploadMode('online')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${uploadMode === 'online' ? 'bg-lemon text-black' : 'text-gray-500'}`}>Online Menu</button>
                        </div>
                        <textarea value={menuText} onChange={e => setMenuText(e.target.value)} placeholder="Pizza ... 250&#10;Burger ... 120" className="flex-1 bg-gray-900 text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-mono text-xs" />
                        <button onClick={handleProcessText} className="bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase">Process Menu</button>
                    </div>
                    <div className="flex-1 bg-black p-6 rounded-[2rem] border border-gray-800 overflow-y-auto no-scrollbar">
                         <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4 sticky top-0 bg-black py-2">Preview ({menu.length} Items)</h4>
                         <div className="space-y-2">
                             {menu.slice().reverse().map(item => (
                                <div key={item.id} className="bg-gray-900 p-3 rounded-xl border border-gray-800 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-white font-bold text-xs uppercase truncate">{item.name}</p>
                                            <div className="flex gap-4 mt-1">
                                                <p className="text-[9px] font-black uppercase text-lemon">Off: ₹{item.offlinePrice}</p>
                                                <p className="text-[9px] font-black uppercase text-lemon">On: ₹{item.onlinePrice}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setMenu(menu.filter(m => m.id !== item.id))} className="text-red-500 p-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                                    </div>
                                </div>
                             ))}
                         </div>
                    </div>
                </div>
                <div className="mt-8 flex gap-4"><button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-5 rounded-2xl text-xs uppercase">Cancel</button><button onClick={() => { onSave(user.id, menu); onClose(); }} className="flex-1 bg-green-600 text-white font-black py-5 rounded-2xl text-xs uppercase">Sync Everything</button></div>
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
    onUpdateUserInfo: (userId: number, name: string, email: string, phone: string) => void;
    onDeleteUser: (userId: number) => void;
}> = ({ users, onBlockUser, onSendMessage, onPasswordChange, onUpdateSubscription, onUpdateMenu, onUpdateUserInfo, onDeleteUser }) => {
    
    const [msgUser, setMsgUser] = useState<RegisteredUser | 'all' | null>(null);
    const [passUser, setPassUser] = useState<RegisteredUser | null>(null);
    const [subUser, setSubUser] = useState<RegisteredUser | null>(null);
    const [menuUser, setMenuUser] = useState<RegisteredUser | null>(null);
    const [editUser, setEditUser] = useState<RegisteredUser | null>(null);

    const getStatusChip = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Approved: return <span className="bg-green-800 text-green-200 text-[9px] px-2 py-0.5 rounded-full uppercase font-black">Live</span>;
            case UserStatus.Pending: return <span className="bg-lemon text-black text-[9px] px-2 py-0.5 rounded-full uppercase font-black">Trial</span>;
            case UserStatus.Blocked: return <span className="bg-red-900 text-red-200 text-[9px] px-2 py-0.5 rounded-full uppercase font-black">Locked</span>;
            case UserStatus.Deleted: return <span className="bg-gray-700 text-gray-400 text-[9px] px-2 py-0.5 rounded-full uppercase font-black">Deleted</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {msgUser && <SendMessageModal user={msgUser} onClose={() => setMsgUser(null)} onSend={onSendMessage} />}
            {passUser && <PasswordManagerModal user={passUser} onClose={() => setPassUser(null)} onSave={onPasswordChange} />}
            {subUser && <SubscriptionModal user={subUser} onClose={() => setSubUser(null)} onSave={onUpdateSubscription} />}
            {menuUser && <MenuUploadModal user={menuUser} onClose={() => setMenuUser(null)} onSave={onUpdateMenu} />}
            {editUser && <EditProfileModal user={editUser} onClose={() => setEditUser(null)} onSave={onUpdateUserInfo} />}

            <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Terminal Command Center</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total Terminals: {users.length}</p>
                    </div>
                    <button onClick={() => setMsgUser('all')} className="w-full md:w-auto bg-red-600 text-white font-black py-4 px-8 rounded-2xl text-[10px] uppercase shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                        Broadcast Notice
                    </button>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/50 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-800">
                                <th className="px-6 py-4">Terminal & Details</th>
                                <th className="px-6 py-4">Phone/Mobile</th>
                                <th className="px-6 py-4">Expiry</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Master Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <p className="font-black text-white uppercase text-sm">{user.restaurantName}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{user.name}</p>
                                        <p className="text-[9px] text-gray-600 lowercase">{user.email}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-lemon font-bold text-xs">{user.phone}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-mono text-[10px] text-white bg-gray-800 px-2 py-1 rounded inline-block">{user.subscriptionEndDate}</p>
                                    </td>
                                    <td className="px-6 py-5">{getStatusChip(user.status)}</td>
                                    <td className="px-6 py-5 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditUser(user)} className="text-[9px] font-black uppercase bg-blue-600 text-white px-3 py-1.5 rounded-lg active:scale-95">Edit</button>
                                            <button onClick={() => onBlockUser(user.id, user.status !== UserStatus.Blocked)} className="text-[9px] font-black uppercase bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg">
                                                {user.status === UserStatus.Blocked ? 'Unlock' : 'Block'}
                                            </button>
                                            <button onClick={() => setMsgUser(user)} className="text-[9px] font-black uppercase bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-lg">Msg</button>
                                            <button onClick={() => setPassUser(user)} className="text-[9px] font-black uppercase bg-gray-800 text-lemon px-3 py-1.5 rounded-lg">Pass</button>
                                            <button onClick={() => setSubUser(user)} className="text-[9px] font-black uppercase bg-teal-900/30 text-teal-400 px-3 py-1.5 rounded-lg">Date</button>
                                            <button onClick={() => setMenuUser(user)} className="text-[9px] font-black uppercase bg-purple-900/30 text-purple-400 px-3 py-1.5 rounded-lg">Menu</button>
                                            <button onClick={() => { if(window.confirm('Delete Terminal?')) onDeleteUser(user.id); }} className="text-[9px] font-black text-red-500 bg-red-900/10 px-3 py-1.5 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <div className="py-20 text-center text-gray-600 font-black uppercase text-xs tracking-widest opacity-50">Database Offline</div>}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
