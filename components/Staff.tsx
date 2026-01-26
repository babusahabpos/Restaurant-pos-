
import React, { useState, useMemo } from 'react';
import { StaffMember, StaffLogEntry } from '../types';

interface StaffProps {
    staff: StaffMember[];
    setStaff: (staff: StaffMember[]) => void;
    staffLog: StaffLogEntry[];
    setStaffLog: React.Dispatch<React.SetStateAction<StaffLogEntry[]>>;
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
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Staff Member</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required />
                    <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role (e.g., Chef, Waiter)" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required />
                    <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar Initials (e.g., JD)" maxLength={2} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark">Add Member</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode, className?: string }> = ({ onClick, disabled, children, className = '' }) => {
    const baseClasses = "text-xs font-bold py-2 px-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 w-full text-center";
    const enabledClasses = "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500";
    const disabledClasses = "bg-gray-900 text-gray-600 cursor-not-allowed";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${className}`}
        >
            {children}
        </button>
    );
};


const StaffList: React.FC<{
    staff: StaffMember[];
    onAction: (id: number, action: StaffLogEntry['action']) => void;
}> = ({ staff, onAction }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {staff.map(member => (
                <div key={member.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between border border-gray-700">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-lemon rounded-full flex items-center justify-center text-black font-bold text-lg mr-4 border-2 border-black/20">
                                {member.avatar}
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase text-xs">{member.name}</h4>
                                <p className="text-[10px] text-gray-400 uppercase">{member.role}</p>
                            </div>
                        </div>
                        <p className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-black uppercase ${
                            member.status === 'Clocked In' ? 'bg-green-500/20 text-green-400' :
                            member.status === 'On Break' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-600 text-gray-300'
                        }`}>{member.status}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <ActionButton onClick={() => onAction(member.id, 'Clock In')} disabled={member.status === 'Clocked In' || member.status === 'On Break'}>IN</ActionButton>
                            <ActionButton onClick={() => onAction(member.id, 'Clock Out')} disabled={member.status === 'Clocked Out'}>OUT</ActionButton>
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                            <ActionButton onClick={() => onAction(member.id, 'Take Break')} disabled={member.status !== 'Clocked In'}>BRK-IN</ActionButton>
                            <ActionButton onClick={() => onAction(member.id, 'End Break')} disabled={member.status !== 'On Break'}>BRK-OUT</ActionButton>
                        </div>
                        <ActionButton onClick={() => onAction(member.id, 'Absent')} disabled={false} className="bg-red-900/50 hover:bg-red-800/60 text-red-300">ABSENT</ActionButton>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Staff: React.FC<StaffProps> = ({ staff, setStaff, staffLog, setStaffLog }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'dairy'>('list');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    
    const handleAddStaff = (newStaffData: Omit<StaffMember, 'id' | 'status' | 'lastAction'>) => {
        setStaff([...staff, {
            ...newStaffData,
            id: Date.now(),
            status: 'Clocked Out',
            lastAction: new Date().toLocaleString()
        }]);
        setIsModalOpen(false);
    };

    const handleAction = (id: number, action: StaffLogEntry['action']) => {
        const member = staff.find(m => m.id === id);
        if (!member) return;

        let newStatus: StaffMember['status'] = member.status;
        if (action === 'Clock In') newStatus = 'Clocked In';
        if (action === 'Clock Out') newStatus = 'Clocked Out';
        if (action === 'Take Break') newStatus = 'On Break';
        if (action === 'End Break') newStatus = 'Clocked In';
        if (action === 'Absent') newStatus = 'Clocked Out';

        setStaff(staff.map(m =>
            m.id === id ? {
                ...m,
                status: newStatus,
                lastAction: new Date().toLocaleString()
            } : m
        ));
        
        setStaffLog(prev => [...prev, {
            id: Date.now(),
            staffId: id,
            staffName: member.name,
            action: action,
            timestamp: new Date()
        }]);
    };

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
        <>
            {isModalOpen && <AddStaffModal onClose={() => setIsModalOpen(false)} onSave={handleAddStaff} />}
            <div className="bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg h-full overflow-y-auto no-scrollbar">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex border-b border-gray-700 w-full md:w-auto">
                        <button onClick={() => setActiveTab('list')} className={`py-2 px-6 font-black uppercase text-[10px] ${activeTab === 'list' ? 'border-b-2 border-lemon text-lemon' : 'text-gray-400'}`}>Staff List</button>
                        <button onClick={() => setActiveTab('dairy')} className={`py-2 px-6 font-black uppercase text-[10px] ${activeTab === 'dairy' ? 'border-b-2 border-lemon text-lemon' : 'text-gray-400'}`}>Attendance Log</button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-lemon text-black font-black py-2 px-6 rounded-lg hover:bg-lemon-dark transition uppercase text-[10px] shadow-xl shadow-lemon/10">
                        Add New Staff
                    </button>
                </div>

                {activeTab === 'list' ? (
                    <StaffList staff={staff} onAction={handleAction} />
                ) : (
                    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-280px)]">
                        <div className="md:w-1/3 bg-black/40 p-4 rounded-2xl overflow-y-auto border border-gray-800">
                             <h4 className="text-white font-black uppercase text-[10px] mb-4 tracking-widest text-center py-2 border-b border-gray-800">Select Staff</h4>
                             <div className="space-y-2">
                                 {staff.map(m => (
                                     <button key={m.id} onClick={() => setSelectedMemberId(m.id)} className={`w-full text-left p-4 rounded-xl font-black uppercase text-[10px] transition-all ${selectedMemberId === m.id ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-400'}`}>{m.name}</button>
                                 ))}
                             </div>
                        </div>
                        <div className="flex-1 bg-black/40 p-4 rounded-2xl overflow-y-auto border border-gray-800">
                             {!selectedMemberId ? (
                                 <div className="h-full flex items-center justify-center opacity-20"><p className="font-black uppercase text-xs">Choose staff to view log</p></div>
                             ) : (
                                 <div className="space-y-6 pb-20">
                                     {dairyData.map(({date, logs}) => (
                                         <div key={date} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                                             <h5 className="text-lemon font-black uppercase text-[9px] mb-3 tracking-widest">{date}</h5>
                                             <div className="space-y-2">
                                                 {logs.map(l => (
                                                     <div key={l.id} className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
                                                         <span className="text-[10px] font-bold text-white uppercase">{l.action}</span>
                                                         <span className="text-[9px] font-black text-gray-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Staff;
