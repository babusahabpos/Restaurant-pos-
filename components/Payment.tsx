
import React, { useState, useMemo } from 'react';
import { PaymentMember, PaymentRecord } from '../types';

interface PaymentProps {
    members: PaymentMember[];
    records: PaymentRecord[];
    onAddMember: (name: string, category: string, type: 'staff' | 'seller') => void;
    onRecordPayment: (memberId: number, paid: number, due: number, date: string) => void;
    onUpdateRecord: (id: number, paid: number, due: number, date: string) => void;
    onDeleteRecord: (id: number) => void;
    onDeleteMember: (id: number) => void;
}

const MemberModal: React.FC<{ 
    type: 'staff' | 'seller'; 
    onClose: () => void; 
    onSave: (name: string, cat: string) => void;
}> = ({ type, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [cat, setCat] = useState('');
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[110] p-4">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 w-full max-w-sm">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Add New {type === 'staff' ? 'Staff' : 'Seller'}</h3>
                <input placeholder="Enter Full Name" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold mb-4" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="Category (e.g. Chef / Vegetable)" className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold mb-6" value={cat} onChange={e => setCat(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl uppercase text-[10px]">Cancel</button>
                    <button onClick={() => { if(name && cat) { onSave(name, cat); onClose(); }}} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl uppercase text-[10px]">Save Member</button>
                </div>
            </div>
        </div>
    );
};

const PaymentFormModal: React.FC<{
    member: PaymentMember;
    record?: PaymentRecord;
    onClose: () => void;
    onSave: (paid: number, due: number, date: string) => void;
}> = ({ member, record, onClose, onSave }) => {
    const [paid, setPaid] = useState(record?.paid.toString() || '');
    const [due, setDue] = useState(record?.due.toString() || '');
    const [date, setDate] = useState(record?.date || new Date().toISOString().split('T')[0]);

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[120] p-4">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 w-full max-w-sm">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{record ? 'Edit Record' : 'Record Payment'}</h3>
                <p className="text-[10px] text-lemon font-black uppercase mb-6">{member.name}</p>
                <div className="space-y-4">
                    <input type="number" placeholder="Paid Amount" className="w-full bg-black text-green-500 p-4 rounded-2xl border border-gray-800 outline-none font-black" value={paid} onChange={e => setPaid(e.target.value)} />
                    <input type="number" placeholder="Due Amount" className="w-full bg-black text-red-500 p-4 rounded-2xl border border-gray-800 outline-none font-black" value={due} onChange={e => setDue(e.target.value)} />
                    <input type="date" className="w-full bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none font-bold" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="flex gap-2 mt-8">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl uppercase text-[10px]">Cancel</button>
                    <button onClick={() => { if(paid !== '' && due !== '') { onSave(parseFloat(paid), parseFloat(due), date); onClose(); }}} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl uppercase text-[10px]">Update Dairy</button>
                </div>
            </div>
        </div>
    );
};

const Payment: React.FC<PaymentProps> = ({ members, records, onAddMember, onRecordPayment, onUpdateRecord, onDeleteRecord, onDeleteMember }) => {
    const [activeTab, setActiveTab] = useState<'staff' | 'seller'>('staff');
    const [view, setView] = useState<'list' | 'dairy'>('list');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const filteredMembers = useMemo(() => members.filter(m => m.type === activeTab), [members, activeTab]);
    const selectedMember = useMemo(() => members.find(m => m.id === selectedMemberId), [members, selectedMemberId]);
    
    const memberRecords = useMemo(() => records.filter(r => r.memberId === selectedMemberId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [records, selectedMemberId]);

    const totalPaid = useMemo(() => memberRecords.reduce((s, r) => s + r.paid, 0), [memberRecords]);
    const currentDue = useMemo(() => memberRecords.length > 0 ? memberRecords[0].due : 0, [memberRecords]);

    const handleDeleteMemberClick = (id: number) => {
        if (window.confirm('WARNING: This will permanently delete this member AND their entire payment dairy. Continue?')) {
            onDeleteMember(id);
        }
    };

    const handleDeleteRecordClick = (id: number) => {
        if (window.confirm('Delete this payment entry?')) {
            onDeleteRecord(id);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-6 animate-fade-in overflow-hidden">
            {showAddModal && <MemberModal type={activeTab} onClose={() => setShowAddModal(false)} onSave={(n, c) => onAddMember(n, c, activeTab)} />}
            {showPaymentModal && selectedMember && (
                <PaymentFormModal 
                    member={selectedMember} 
                    record={editingRecord || undefined} 
                    onClose={() => { setShowPaymentModal(false); setEditingRecord(null); }} 
                    onSave={(p, d, dt) => editingRecord ? onUpdateRecord(editingRecord.id, p, d, dt) : onRecordPayment(selectedMember.id, p, d, dt)}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/50 p-4 rounded-[2rem] border border-gray-800 shrink-0">
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-gray-800">
                    <button onClick={() => { setActiveTab('staff'); setView('list'); }} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'staff' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Staff Hub</button>
                    <button onClick={() => { setActiveTab('seller'); setView('list'); }} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'seller' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Seller Hub</button>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-lemon text-black font-black px-6 py-3 rounded-2xl text-[10px] uppercase shadow-xl shadow-lemon/10 active:scale-95 transition-all">Add New Member</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {view === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMembers.length > 0 ? filteredMembers.map(member => {
                            const mRecords = records.filter(r => r.memberId === member.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                            const due = mRecords.length > 0 ? mRecords[0].due : 0;
                            return (
                                <div key={member.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] hover:border-lemon/30 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[8px] font-black bg-gray-800 text-lemon px-2.5 py-1 rounded-full uppercase tracking-widest">{member.category}</span>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-2 truncate">{member.name}</h4>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteMemberClick(member.id)} 
                                            className="text-gray-600 hover:text-red-500 transition-colors p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-6">
                                        <div>
                                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Latest Due</p>
                                            <p className={`text-xl font-black ${due > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{due.toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => { setSelectedMemberId(member.id); setView('dairy'); }} className="bg-white text-black font-black px-5 py-2.5 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-all">Dairy View</button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-24 text-center opacity-30 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                                <p className="font-black uppercase text-xs tracking-widest italic">No members in this category</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-black border border-gray-800 p-6 rounded-[2.5rem] shadow-2xl">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button onClick={() => setView('list')} className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg></button>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{selectedMember?.name}</h3>
                                    <p className="text-[10px] text-lemon font-black uppercase mt-1 tracking-widest">{selectedMember?.category} • Running Dairy</p>
                                </div>
                            </div>
                            <div className="flex gap-6 text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-gray-800 pt-4 sm:pt-0 justify-around">
                                <div><p className="text-[8px] text-gray-500 font-black uppercase">Total Paid</p><p className="text-xl font-black text-green-500">₹{totalPaid.toLocaleString()}</p></div>
                                <div><p className="text-[8px] text-gray-500 font-black uppercase italic">Current Balance Due</p><p className="text-xl font-black text-red-500">₹{currentDue.toLocaleString()}</p></div>
                            </div>
                            <button onClick={() => setShowPaymentModal(true)} className="w-full sm:w-auto bg-lemon text-black font-black px-8 py-4 rounded-2xl text-[10px] uppercase shadow-lg shadow-lemon/10 active:scale-95 transition-all">Record Payment</button>
                        </div>

                        <div className="space-y-3">
                            {memberRecords.length > 0 ? memberRecords.map(record => (
                                <div key={record.id} className="bg-gray-900/50 border border-gray-800 p-5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-gray-700 transition-all group">
                                    <div className="flex flex-1 items-center gap-8 w-full sm:w-auto justify-between sm:justify-start">
                                        <div className="text-center sm:text-left min-w-[100px]">
                                            <p className="text-[8px] text-gray-500 font-black uppercase">Date</p>
                                            <p className="text-sm font-black text-white">{record.date}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] text-gray-500 font-black uppercase">Paid</p>
                                            <p className="text-lg font-black text-green-500">₹{record.paid.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] text-gray-500 font-black uppercase italic">Balance Remaining</p>
                                            <p className="text-lg font-black text-red-500">₹{record.due.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button onClick={() => { setEditingRecord(record); setShowPaymentModal(true); }} className="flex-1 sm:flex-none bg-blue-600/10 text-blue-400 font-black px-5 py-2.5 rounded-xl text-[9px] uppercase border border-blue-600/20 active:scale-95 transition-all">Edit</button>
                                        <button onClick={() => handleDeleteRecordClick(record.id)} className="flex-1 sm:flex-none bg-red-600/10 text-red-500 font-black px-5 py-2.5 rounded-xl text-[9px] uppercase border border-red-600/20 active:scale-95 transition-all">Delete</button>
                                    </div>
                                </div>
                            )) : <div className="py-20 text-center text-gray-700 font-black uppercase text-[10px] tracking-widest italic opacity-50">Empty Dairy Logs</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
