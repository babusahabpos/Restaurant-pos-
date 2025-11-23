import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_STAFF } from '../constants';
import { StaffMember, StaffLogEntry } from '../types';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {staff.map(member => (
                <div key={member.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-lemon rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                                {member.avatar}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{member.name}</h4>
                                <p className="text-sm text-gray-400">{member.role}</p>
                            </div>
                        </div>
                        <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                            member.status === 'Clocked In' ? 'bg-green-500/20 text-green-400' :
                            member.status === 'On Break' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-600 text-gray-300'
                        }`}>{member.status}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <ActionButton onClick={() => onAction(member.id, 'Clock In')} disabled={member.status === 'Clocked In' || member.status === 'On Break'}>Check In</ActionButton>
                            <ActionButton onClick={() => onAction(member.id, 'Clock Out')} disabled={member.status === 'Clocked Out'}>Check Out</ActionButton>
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                            <ActionButton onClick={() => onAction(member.id, 'Take Break')} disabled={member.status !== 'Clocked In'}>Break In</ActionButton>
                            <ActionButton onClick={() => onAction(member.id, 'End Break')} disabled={member.status !== 'On Break'}>Break Out</ActionButton>
                        </div>
                        <ActionButton onClick={() => onAction(member.id, 'Absent')} disabled={false} className="bg-red-900/50 hover:bg-red-800/60 text-red-300">Mark Absent</ActionButton>
                    </div>
                </div>
            ))}
        </div>
    );
};

const StaffDairy: React.FC<{
    staff: StaffMember[];
    staffLog: StaffLogEntry[];
}> = ({ staff, staffLog }) => {
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(staff[0] || null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const dairyData = useMemo(() => {
        if (!selectedStaff) return [];
        const logs = staffLog.filter(log => log.staffId === selectedStaff.id);
        const groupedByDate = logs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {} as Record<string, StaffLogEntry[]>);
        return Object.entries(groupedByDate).map(([date, logs]) => ({ date, logs })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedStaff, staffLog]);

    useEffect(() => {
        if (dairyData.length > 0) {
            setSelectedDate(dairyData[0].date);
        } else {
            setSelectedDate(null);
        }
    }, [dairyData]);
    
    const selectedLogs = useMemo(() => {
        if (!selectedDate) return [];
        return dairyData.find(d => d.date === selectedDate)?.logs.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()) || [];
    }, [selectedDate, dairyData]);


    return (
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
            {/* Staff List */}
            <div className="md:w-1/4 bg-gray-800 p-3 rounded-lg overflow-y-auto">
                <h4 className="text-white font-bold mb-2 p-2">Select Staff</h4>
                <div className="space-y-2">
                    {staff.map(member => (
                        <button
                            key={member.id}
                            onClick={() => setSelectedStaff(member)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedStaff?.id === member.id ? 'bg-lemon text-black' : 'hover:bg-gray-700 text-white'}`}
                        >
                            {member.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dairy Details */}
            <div className="flex-1 flex flex-col md:flex-row gap-4">
                {selectedStaff ? (
                    <>
                    <div className="md:w-1/3 bg-gray-800 p-3 rounded-lg overflow-y-auto">
                        <h4 className="text-white font-bold mb-2 p-2">Dates</h4>
                         <div className="space-y-2">
                            {dairyData.map(({ date }) => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedDate === date ? 'bg-lemon text-black' : 'hover:bg-gray-700 text-white'}`}
                                >
                                    {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-800 p-4 rounded-lg overflow-y-auto">
                         <h4 className="text-white font-bold mb-4">Log for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}</h4>
                         <div className="space-y-3">
                            {selectedLogs.length > 0 ? selectedLogs.map(log => (
                                <div key={log.id} className="flex items-center bg-gray-900 p-3 rounded-lg">
                                    <p className="flex-1 text-gray-300">{log.action}</p>
                                    <p className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                </div>
                            )) : <p className="text-gray-500 text-center">No logs for this date.</p>}
                         </div>
                    </div>
                    </>
                ) : <p className="text-gray-500 text-center flex-1">Select a staff member to view their dairy.</p>}
            </div>
        </div>
    );
};

const Staff: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>(() => {
        try {
            const savedStaff = localStorage.getItem('babuSahabPos_staff');
            return savedStaff ? JSON.parse(savedStaff) : MOCK_STAFF;
        } catch (error) {
            console.error("Error loading staff from localStorage", error);
            return MOCK_STAFF;
        }
    });
    
    const [staffLog, setStaffLog] = useState<StaffLogEntry[]>(() => {
        try {
            const savedLog = localStorage.getItem('babuSahabPos_staffLog');
            if (savedLog) {
                const parsedLog = JSON.parse(savedLog);
                return parsedLog.map((log: any) => ({
                    ...log,
                    timestamp: new Date(log.timestamp),
                }));
            }
        } catch (error) {
            console.error("Error loading staff log from localStorage", error);
        }
        return [];
    });
    
    useEffect(() => {
        try {
            localStorage.setItem('babuSahabPos_staff', JSON.stringify(staff));
            localStorage.setItem('babuSahabPos_staffLog', JSON.stringify(staffLog));
        } catch (error) {
            console.error("Error saving staff data to localStorage", error);
        }
    }, [staff, staffLog]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'dairy'>('list');
    
    const handleAddStaff = (newStaff: Omit<StaffMember, 'id' | 'status' | 'lastAction'>) => {
        setStaff([...staff, {
            ...newStaff,
            id: Date.now(),
            status: 'Clocked Out',
            lastAction: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
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
                lastAction: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            } : m
        ));
        
        const newLogEntry: StaffLogEntry = {
            id: Date.now(),
            staffId: id,
            staffName: member.name,
            action: action,
            timestamp: new Date()
        };
        setStaffLog(prev => [...prev, newLogEntry]);
    };

    return (
        <>
            {isModalOpen && <AddStaffModal onClose={() => setIsModalOpen(false)} onSave={handleAddStaff} />}
            <div className="bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex border-b border-gray-700">
                        <button onClick={() => setActiveTab('list')} className={`py-2 px-4 ${activeTab === 'list' ? 'border-b-2 border-lemon text-lemon' : 'text-gray-400'}`}>Staff List</button>
                        <button onClick={() => setActiveTab('dairy')} className={`py-2 px-4 ${activeTab === 'dairy' ? 'border-b-2 border-lemon text-lemon' : 'text-gray-400'}`}>Staff Dairy</button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark transition">
                        Add New Staff
                    </button>
                </div>
                {activeTab === 'list' && <StaffList staff={staff} onAction={handleAction} />}
                {activeTab === 'dairy' && <StaffDairy staff={staff} staffLog={staffLog} />}
            </div>
        </>
    );
};

export default Staff;