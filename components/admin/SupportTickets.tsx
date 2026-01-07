
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style={{height: '90vh'}}>
                <h3 className="text-xl font-semibold text-white mb-2">Ticket #{ticket.id} - {ticket.subject}</h3>
                <p className="text-sm text-gray-400 mb-4">From: {ticket.userName}</p>

                <div className="flex-grow bg-gray-900 p-4 rounded-lg overflow-y-auto space-y-4 mb-4">
                   {ticket.messages.map((msg, index) => (
                       <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-lemon/20' : 'bg-gray-700'}`}>
                               <p className="text-sm text-white">{msg.text}</p>
                               {msg.attachment && (
                                    <div className="mt-3 border-t border-gray-600 pt-2">
                                        {msg.attachmentType === 'image' ? (
                                            <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                                                <img src={msg.attachment} alt="Attachment" className="max-h-48 rounded border border-gray-500" />
                                            </a>
                                        ) : (
                                            <a href={msg.attachment} download="attachment.pdf" className="text-blue-400 text-xs">Download PDF</a>
                                        )}
                                    </div>
                               )}
                               <p className="text-[10px] text-gray-400 text-right mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                           </div>
                       </div>
                   ))}
                </div>
                
                {ticket.status !== 'Resolved' && (
                    <div className="mt-auto">
                        <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={3} className="w-full bg-gray-700 text-white p-2 rounded outline-none focus:border-lemon border border-transparent"/>
                        <div className="flex justify-between items-center mt-4">
                             <button onClick={() => { onResolve(ticket.id); onClose(); }} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Mark Resolved</button>
                            <div>
                                <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2">Close</button>
                                <button onClick={handleSendReply} disabled={!reply.trim()} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Send</button>
                            </div>
                        </div>
                    </div>
                )}
                {ticket.status === 'Resolved' && <button onClick={onClose} className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl mt-4">Back</button>}
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
            case 'Open': return <span className="bg-blue-800 text-blue-300 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Open</span>;
            case 'Pending': return <span className="bg-lemon/20 text-lemon text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Pending</span>;
            case 'Resolved': return <span className="bg-gray-700 text-gray-300 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Resolved</span>;
        }
    };

    return (
        <>
        {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onReply={onReply} onResolve={onResolve} />}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Support Tickets ({tickets.length})</h3>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-black/50">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-mono">#{ticket.id.toString().slice(-4)}</td>
                                <td className="px-6 py-4 text-white font-bold">{ticket.userName}</td>
                                <td className="px-6 py-4">{ticket.subject}</td>
                                <td className="px-6 py-4">{getStatusChip(ticket.status)}</td>
                                <td className="px-6 py-4 flex gap-4 items-center">
                                    <button onClick={() => setSelectedTicket(ticket)} className="text-lemon font-black uppercase text-[10px] hover:underline">View</button>
                                    <button onClick={() => { if(window.confirm('Delete this ticket?')) onDelete(ticket.id); }} className="text-red-500 font-black uppercase text-[10px] hover:underline">Delete</button>
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

export default SupportTickets;
