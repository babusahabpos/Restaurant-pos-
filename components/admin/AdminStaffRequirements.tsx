
import React, { useState } from 'react';
import { StaffJobPost, StaffRequirementRequest } from '../../types';

interface AdminStaffRequirementsProps {
    requests: StaffRequirementRequest[];
    jobPosts: StaffJobPost[];
    onAddPost: (post: Omit<StaffJobPost, 'id' | 'timestamp'>) => void;
    onDeletePost: (id: number) => void;
    onMarkRead: (id: number) => void;
}

const AdminStaffRequirements: React.FC<AdminStaffRequirementsProps> = ({ requests, jobPosts, onAddPost, onDeletePost, onMarkRead }) => {
    const [view, setView] = useState<'requests' | 'create'>('requests');
    const [formData, setFormData] = useState({
        staffName: '',
        category: '',
        phone: '',
        location: '',
        cvDetails: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddPost(formData);
        setFormData({ staffName: '', category: '', phone: '', location: '', cvDetails: '' });
        setView('requests');
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
                <button 
                    onClick={() => setView('requests')}
                    className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all ${view === 'requests' ? 'bg-lemon text-black' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    User Requests ({requests.filter(r => !r.isRead).length})
                </button>
                <button 
                    onClick={() => setView('create')}
                    className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all ${view === 'create' ? 'bg-lemon text-black' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Post New Staff
                </button>
            </div>

            {view === 'requests' ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Requirement Inbox</h3>
                    {requests.length > 0 ? (
                        requests.slice().reverse().map(req => (
                            <div key={req.id} className={`p-4 rounded-xl border ${req.isRead ? 'bg-gray-900 border-gray-800' : 'bg-lemon/5 border-lemon/30'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-lemon font-bold uppercase text-[10px]">{req.restaurantName}</p>
                                        <p className="text-[9px] text-gray-500 uppercase">{new Date(req.timestamp).toLocaleString()}</p>
                                    </div>
                                    {!req.isRead && <button onClick={() => onMarkRead(req.id)} className="text-[8px] bg-lemon text-black px-2 py-1 rounded font-black uppercase">Mark Read</button>}
                                </div>
                                <p className="text-white font-bold text-sm mb-1">{req.requirement}</p>
                                <p className="text-lemon font-black text-xs">Salary: ₹{req.salary}</p>
                            </div>
                        ))
                    ) : <p className="text-center py-10 text-gray-600 italic">No incoming requests</p>}
                    
                    <hr className="border-gray-800 my-6" />
                    
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Active Staff Posts ({jobPosts.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobPosts.map(post => (
                            <div key={post.id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold">{post.staffName}</p>
                                    <p className="text-[10px] text-lemon font-bold uppercase tracking-widest">{post.category}</p>
                                </div>
                                <button onClick={() => onDeletePost(post.id)} className="text-red-500 hover:text-red-400 p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white uppercase mb-6 tracking-tight text-center">Post Available Staff</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <input 
                                placeholder="Staff Name" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.staffName}
                                onChange={e => setFormData({...formData, staffName: e.target.value})}
                                required
                            />
                            <input 
                                placeholder="Staff Category (Ex. Chef, Waiter)" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                required
                            />
                            <input 
                                placeholder="Phone Number" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                            <input 
                                placeholder="Location" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                placeholder="CV Summary / Experience Details" 
                                className="w-full bg-black text-lemon p-3 rounded-xl border border-gray-800 outline-none h-[155px]"
                                value={formData.cvDetails}
                                onChange={e => setFormData({...formData, cvDetails: e.target.value})}
                                required
                            />
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-xs">Publish Post</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminStaffRequirements;
