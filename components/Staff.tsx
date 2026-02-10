
import React, { useState, useMemo } from 'react';
import { StaffMember, StaffLogEntry } from '../types';

interface StaffProps {
    staff: StaffMember[];
    onAddStaff: (staff: Omit<StaffMember, 'id' | 'status' | 'lastAction'>) => void;
    onAction: (id: number, action: StaffLogEntry['action']) => void;
    staffLog: StaffLogEntry[];
}

const AddStaffModal: React.FC<{
    onClose: () => void;
    onSave: (staff: Omit<StaffMember, 'id' | 'status' | 'lastAction'>) => void;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [avatar, setAvatar] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, role, avatar: avatar || name.substring(0, 2).toUpperCase() });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[110] p-4">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 w-full max-w-sm">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Add Staff Member</h3>
                <input placeholder="Full Name" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold mb-4" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="Role (e.g. Chef)" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold mb-4" value={role} onChange={e => setRole(e.target.value)} />
                <input placeholder="Avatar Initials (RS)" maxLength={2} className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold mb-6" value={avatar} onChange={e => setAvatar(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl uppercase text-[10px]">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl uppercase text-[10px]">Save Staff</button>
                </div>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode, className?: string }> = ({ onClick, disabled, children, className = '' }) => {
    const baseClasses = "text-[9px] font-black py-2.5 rounded-lg transition-all active:scale-95 w-full text-center uppercase tracking-widest";
    const enabledClasses = "bg-gray-800 text-white hover:bg-gray-700";
    const disabledClasses = "bg-black text-gray-700 cursor-not-allowed border border-gray-900";

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${className}`}>
            {children}
        </button>
    );
};

const Staff: React.FC<StaffProps> = ({ staff = [], onAddStaff, onAction, staffLog = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'dairy'>('list');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    const dairyData = useMemo(() => {
        if (!selectedMemberId) return [];
        const logs = staffLog.filter(log => log.staffId === selectedMemberId);
        const groupedByDate = logs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {} as Record<string, StaffLogEntry[]>);
        return Object.entries(groupedByDate).map(([date, logs]) => ({ date, logs })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedMemberId, staffLog]);

    return (
        <div className="h-full flex flex-col p-4 space-y-6 animate-fade-in overflow-hidden">
            {isModalOpen && <AddStaffModal onClose={() => setIsModalOpen(false)} onSave={onAddStaff} />}
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/50 p-4 rounded-[2rem] border border-gray-800 shrink-0">
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-gray-800">
                    <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'list' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Staff List</button>
                    <button onClick={() => setActiveTab('dairy')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'dairy' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Attendance Log</button>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-lemon text-black font-black px-6 py-3 rounded-2xl text-[10px] uppercase shadow-xl shadow-lemon/10 active:scale-95 transition-all">Add New Staff</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {activeTab === 'list' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {staff.length > 0 ? staff.map(member => (
                            <div key={member.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
                                <div>
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-lemon rounded-full flex items-center justify-center text-black font-black text-lg mr-4 border-4 border-black/20 shadow-lg">
                                            {member.avatar}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-white uppercase text-xs truncate tracking-tighter">{member.name}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-6">
                                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                                            member.status === 'Clocked In' ? 'bg-green-500/20 text-green-400' :
                                            member.status === 'On Break' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-gray-800 text-gray-500'
                                        }`}>{member.status}</span>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase">{member.lastAction}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton onClick={() => onAction(member.id, 'Clock In')} disabled={member.status === 'Clocked In' || member.status === 'On Break'}>Clock In</ActionButton>
                                        <ActionButton onClick={() => onAction(member.id, 'Clock Out')} disabled={member.status === 'Clocked Out'}>Clock Out</ActionButton>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton onClick={() => onAction(member.id, 'Take Break')} disabled={member.status !== 'Clocked In'}>Break In</ActionButton>
                                        <ActionButton onClick={() => onAction(member.id, 'End Break')} disabled={member.status !== 'On Break'}>Break Out</ActionButton>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-24 text-center opacity-20 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                <p className="font-black uppercase text-xs tracking-widest italic">No staff found. Please add members.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6 h-full min-h-[400px]">
                        <div className="md:w-64 bg-black/40 p-4 rounded-[2.5rem] overflow-y-auto border border-gray-800 shrink-0">
                             <h4 className="text-white font-black uppercase text-[10px] mb-4 tracking-widest text-center py-2 border-b border-gray-800">Select Member</h4>
                             <div className="space-y-2">
                                 {staff.map(m => (
                                     <button key={m.id} onClick={() => setSelectedMemberId(m.id)} className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] transition-all ${selectedMemberId === m.id ? 'bg-lemon text-black shadow-lg' : 'bg-gray-900 text-gray-400 hover:text-white'}`}>{m.name}</button>
                                 ))}
                                 {staff.length === 0 && <p className="text-[9px] text-gray-700 text-center uppercase py-10 font-black">List Empty</p>}
                             </div>
                        </div>
                        <div className="flex-1 bg-black/40 p-6 rounded-[2.5rem] overflow-y-auto border border-gray-800 no-scrollbar">
                             {!selectedMemberId ? (
                                 <div className="h-full flex flex-col items-center justify-center opacity-10">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                     <p className="font-black uppercase text-xs">Pick staff to view attendance dairy</p>
                                 </div>
                             ) : (
                                 <div className="space-y-6">
                                     {dairyData.map(({date, logs}) => (
                                         <div key={date} className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] shadow-lg">
                                             <h5 className="text-lemon font-black uppercase text-[9px] mb-4 tracking-[0.2em] border-b border-white/5 pb-2">{date}</h5>
                                             <div className="space-y-3">
                                                 {logs.map(l => (
                                                     <div key={l.id} className="flex justify-between items-center bg-black/50 p-3 rounded-xl border border-white/5">
                                                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{l.action}</span>
                                                         <span className="text-[9px] font-bold text-gray-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                     {dairyData.length === 0 && <p className="text-center py-20 text-gray-700 font-black uppercase text-[10px]">No logs for this member</p>}
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Staff;
