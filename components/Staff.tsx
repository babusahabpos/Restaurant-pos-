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
                const parsedLog = JSON.parse(savedLog) as StaffLogEntry[];
                return parsedLog.map(log => ({
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
    const [selectedStaffForDairy, setSelectedStaffForDairy] = useState<StaffMember | null>(null);
    
    const dairyData = useMemo(() => {
        if (!selectedStaffForDairy) return [];
        
        const logs = staffLog
            .filter(log => log.staffId === selectedStaffForDairy.id)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const groupedByDate = logs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(log);
            return acc;
        }, {} as Record<string, StaffLogEntry[]>);
        
        return Object.entries(groupedByDate).map(([date, logs]) => ({ date, logs }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedStaffForDairy, staffLog]);


    const getStatusChip = (status: 'Clocked In' | 'Clocked Out' | 'On Break') => {
        switch (status) {
            case 'Clocked In':
                return <span className="bg-green-900 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">Clocked In</span>;
            case 'Clocked Out':
                return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Clocked Out</span>;
            case 'On Break':
                return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">On Break</span>;
        }
    };
    
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
        let newStatus: StaffMember['status'];
        switch(action) {
            case 'Clock In': newStatus = 'Clocked In'; break;
            case 'Clock Out': newStatus = 'Clocked Out'; break;
            case 'Take Break': newStatus = 'On Break'; break;
            case 'End Break': newStatus = 'Clocked In'; break;
            default: return;
        }

        const member = staff.find(m => m.id === id);
        if (!member) return;

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
        setStaffLog(prevLog => [newLogEntry, ...prevLog]);
    };
    
    const handleMarkAbsent = (member: StaffMember) => {
        if (member.status !== 'Clocked Out') {
            alert("Cannot mark an active staff member as absent.");
            return;
        }
        const today = new Date();
        const alreadyAbsent = staffLog.some(log =>
            log.staffId === member.id &&
            log.action === 'Absent' &&
            new Date(log.timestamp).toDateString() === today.toDateString()
        );

        if (alreadyAbsent) {
            alert(`${member.name} is already marked as absent for today.`);
            return;
        }

        const newLogEntry: StaffLogEntry = {
            id: Date.now(),
            staffId: member.id,
            staffName: member.name,
            action: 'Absent',
            timestamp: today
        };
        setStaffLog(prevLog => [newLogEntry, ...prevLog]);
        alert(`${member.name} has been marked as absent for today.`);
    };

    return (
        <>
            {isModalOpen && <AddStaffModal onClose={() => setIsModalOpen(false)} onSave={handleAddStaff} />}
            <div className="bg-black p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-lg font-semibold text-white">Staff Management</h3>
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark transition">
                        Add Staff Member
                    </button>
                </div>

                <div className="flex border-b border-gray-800 mb-4">
                    <button onClick={() => { setActiveTab('list'); setSelectedStaffForDairy(null); }} className={`py-2 px-4 transition-colors duration-300 ${activeTab === 'list' ? 'text-lemon border-b-2 border-lemon font-semibold' : 'text-gray-400 hover:text-white'}`}>Staff List</button>
                    <button onClick={() => setActiveTab('dairy')} className={`py-2 px-4 transition-colors duration-300 ${activeTab === 'dairy' ? 'text-lemon border-b-2 border-lemon font-semibold' : 'text-gray-400 hover:text-white'}`}>Staff Dairy</button>
                </div>

                {activeTab === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Avatar</th>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Last Action</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(member => (
                                    <tr key={member.id} className="bg-black border-b border-gray-800 hover:bg-gray-900">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-300">
                                                {member.avatar}
                                            </div>
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{member.name}</th>
                                        <td className="px-6 py-4">{member.role}</td>
                                        <td className="px-6 py-4">{getStatusChip(member.status)}</td>
                                        <td className="px-6 py-4">{member.lastAction}</td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                            {member.status === 'Clocked In' && <button onClick={() => handleAction(member.id, 'Clock Out')} className="font-medium text-blue-500 hover:underline">Clock Out</button>}
                                            {member.status === 'Clocked Out' && <button onClick={() => handleAction(member.id, 'Clock In')} className="font-medium text-blue-500 hover:underline">Clock In</button>}
                                            {member.status === 'On Break' && <button onClick={() => handleAction(member.id, 'End Break')} className="font-medium text-green-500 hover:underline">End Break</button>}
                                            {member.status === 'Clocked In' && <button onClick={() => handleAction(member.id, 'Take Break')} className="font-medium text-lemon hover:underline">Take Break</button>}
                                            {member.status === 'Clocked Out' && <button onClick={() => handleMarkAbsent(member)} className="font-medium text-lemon hover:underline">Mark Absent</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : !selectedStaffForDairy ? (
                    <div>
                         <h4 className="text-md font-semibold text-white mb-3">Select a staff member to view their dairy.</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {staff.map(member => (
                                <div key={member.id} onClick={() => setSelectedStaffForDairy(member)} className="bg-gray-900 p-4 rounded-lg text-center cursor-pointer hover:ring-2 hover:ring-lemon transition border border-gray-800">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-300 text-2xl mx-auto mb-3">
                                        {member.avatar}
                                    </div>
                                    <p className="font-semibold text-white">{member.name}</p>
                                    <p className="text-sm text-gray-400">{member.role}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center mb-4">
                            <button onClick={() => setSelectedStaffForDairy(null)} className="mr-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            </button>
                            <h4 className="text-lg font-semibold text-white">Daily Log for <span className="text-lemon">{selectedStaffForDairy.name}</span></h4>
                        </div>
                        {dairyData.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No activity recorded for this staff member.</p>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {dairyData.map(({ date, logs }) => (
                                    <div key={date} className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                                        <p className="font-semibold text-lemon border-b border-gray-800 pb-2 mb-2">{date}</p>
                                        <ul className="space-y-1">
                                            {logs.map(log => (
                                                <li key={log.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-300">{log.action}</span>
                                                    <span className="text-gray-500">{log.action !== 'Absent' ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Staff;