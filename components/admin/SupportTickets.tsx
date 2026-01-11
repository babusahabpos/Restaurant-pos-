
import React, { useState } from 'react';
import { SupportTicket } from '../../types';

const TicketDetailsModal: React.FC<{
    ticket: SupportTicket;
    onClose: () => void;
    onReply: (ticketId: number, message: string) => void;
    onResolve: (ticketId: number) => void;
}> = ({ ticket, onClose, onReply, onResolve }) => {
    const [reply, setReply] = useState('');

    const handleSendReply = () => {
        if (!reply.trim()) return;
        onReply(ticket.id, reply);
        setReply('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[200] p-4">
            <div className="bg-gray-800 p-6 rounded-[2rem] shadow-xl w-full max-w-2xl flex flex-col border border-gray-700 animate-fade-in" style={{height: '85vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Chat: {ticket.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ticket.status === 'Resolved' ? 'bg-gray-700 text-gray-400' : 'bg-lemon text-black'}`}>
                        {ticket.status === 'Resolved' ? 'Closed' : 'Active'}
                    </span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 tracking-widest border-b border-gray-700 pb-2">User: {ticket.restaurantName} (ID: {ticket.userId})</p>

                <div className="flex-grow bg-black/40 p-4 rounded-2xl overflow-y-auto space-y-4 mb-4 no-scrollbar border border-gray-700">
                   {ticket.messages.map((msg, index) => (
                       <div key={index} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                           <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === 'admin' ? 'bg-lemon text-black rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none'}`}>
                               <p className="text-xs font-bold leading-relaxed">{msg.text}</p>
                               {msg.attachment && (
                                    <div className="mt-3 border-t border-black/10 pt-2">
                                        {msg.attachmentType === 'image' ? (
                                            <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                                                <img src={msg.attachment} alt="Attachment" className="max-h-48 rounded-xl shadow-lg" />
                                            </a>
                                        ) : (
                                            <a href={msg.attachment} download="attachment.pdf" className="text-[10px] font-black uppercase underline">View PDF</a>
                                        )}
                                    </div>
                               )}
                           </div>
                           <p className="text-[8px] text-gray-500 font-black uppercase mt-1 px-1">{new Date(msg.timestamp).toLocaleString()}</p>
                       </div>
                   ))}
                </div>
                
                {ticket.status !== 'Resolved' && (
                    <div className="mt-auto space-y-3">
                        <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response..." rows={3} className="w-full bg-black text-lemon p-4 rounded-2xl outline-none focus:border-lemon border border-gray-700 font-bold text-sm"/>
                        <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => { if(window.confirm('Close this chat? User will no longer be able to reply.')) { onResolve(ticket.id); onClose(); } }} className="bg-red-600/10 text-red-500 border border-red-600/30 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest active:scale-95">Close Chat</button>
                             <button onClick={handleSendReply} disabled={!reply.trim()} className="bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-lemon/10">Send Reply</button>
                        </div>
                    </div>
                )}
                
                {ticket.status === 'Resolved' && (
                    <button onClick={onClose} className="w-full bg-gray-700 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest">Back to Inbox</button>
                )}
            </div>
        </div>
    );
};

const SupportTickets: React.FC<{
    tickets: SupportTicket[];
    onReply: (ticketId: number, message: string) => void;
    onResolve: (ticketId: number) => void;
    onDelete: (ticketId: number) => void;
}> = ({ tickets, onReply, onResolve, onDelete }) => {
    
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    
    const getStatusChip = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">New Message</span>;
            case 'Pending': return <span className="bg-yellow-600/20 text-yellow-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">Waiting</span>;
            case 'Resolved': return <span className="bg-gray-800 text-gray-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">Closed</span>;
        }
    };

    return (
        <>
        {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onReply={onReply} onResolve={onResolve} />}
        <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 shadow-xl overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Support & Communication Hub</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Inbox: {tickets.length}</p>
            </div>
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-black/50 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-800">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Ordering User</th>
                            <th className="px-6 py-4">Topic / Subject</th>
                            <th className="px-6 py-4">Last Update</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {tickets.slice().reverse().map(ticket => (
                            <tr key={ticket.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">{getStatusChip(ticket.status)}</td>
                                <td className="px-6 py-4">
                                    <p className="text-white font-black uppercase text-xs">{ticket.restaurantName}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">ID: {ticket.userId}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className={`text-xs font-bold uppercase tracking-tighter ${ticket.subject === 'Renewal Request' ? 'text-lemon' : 'text-white'}`}>{ticket.subject}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[9px] text-gray-500 font-black uppercase">{new Date(ticket.lastUpdate).toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setSelectedTicket(ticket)} className="text-[10px] font-black uppercase bg-lemon text-black px-4 py-1.5 rounded-lg hover:bg-lemon-dark transition-all">Chat</button>
                                        <button onClick={() => { if(window.confirm('Delete this message thread permanently?')) onDelete(ticket.id); }} className="text-[10px] font-black text-red-500 uppercase p-1.5 bg-red-600/10 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tickets.length === 0 && <div className="py-24 text-center text-gray-600 font-black uppercase text-xs tracking-widest opacity-50">Global Inbox Empty</div>}
            </div>
        </div>
        </>
    );
};

export default SupportTickets;