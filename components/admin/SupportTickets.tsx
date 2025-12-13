
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style={{height: '90vh'}}>
                <h3 className="text-xl font-semibold text-white mb-2">Ticket #{ticket.id} - {ticket.subject}</h3>
                <p className="text-sm text-gray-400 mb-4">From: {ticket.userName}</p>

                <div className="flex-grow bg-gray-900 p-4 rounded-lg overflow-y-auto space-y-4 mb-4">
                   {ticket.messages.map((msg, index) => (
                       <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-lemon/20' : 'bg-gray-700'}`}>
                               <p className="text-sm text-white">{msg.text}</p>
                               {/* Added Attachment Rendering Logic */}
                               {msg.attachment && (
                                    <div className="mt-2">
                                        {msg.attachmentType === 'image' ? (
                                            <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                                                <img src={msg.attachment} alt="Attachment" className="max-h-40 rounded border border-gray-600 hover:opacity-90 transition" />
                                            </a>
                                        ) : (
                                            <a href={msg.attachment} download="attachment.pdf" className="flex items-center gap-2 text-blue-400 underline text-sm bg-black/20 p-2 rounded">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                Download PDF Attachment
                                            </a>
                                        )}
                                    </div>
                               )}
                               <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                           </div>
                       </div>
                   ))}
                </div>
                
                {ticket.status !== 'Resolved' && (
                    <div className="mt-auto">
                        <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={3} className="w-full bg-gray-700 text-white p-2 rounded"/>
                        <div className="flex justify-between items-center mt-4">
                             <button onClick={() => { onResolve(ticket.id); onClose(); }} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Mark as Resolved</button>
                            <div>
                                <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2">Close</button>
                                <button onClick={handleSendReply} disabled={!reply.trim()} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg disabled:bg-lemon/50 disabled:text-gray-500">Send Reply</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SupportTickets: React.FC<{
    tickets: SupportTicket[];
    onReply: (ticketId: number, message: string) => void;
    onResolve: (ticketId: number) => void;
}> = ({ tickets, onReply, onResolve }) => {
    
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    
    const getStatusChip = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return <span className="bg-blue-800 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">Open</span>;
            case 'Pending': return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Pending</span>;
            case 'Resolved': return <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">Resolved</span>;
        }
    };

    return (
        <>
        {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onReply={onReply} onResolve={onResolve} />}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-white">Support Tickets</h3>
                 <input type="text" placeholder="Search tickets..." className="w-full md:w-1/2 bg-gray-800 text-white p-2 rounded-lg border border-gray-700" />
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Ticket ID</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Subject</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Update</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4">#{ticket.id}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{ticket.userName}</th>
                                <td className="px-6 py-4">{ticket.subject}</td>
                                <td className="px-6 py-4">{getStatusChip(ticket.status)}</td>
                                <td className="px-6 py-4">{new Date(ticket.lastUpdate).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setSelectedTicket(ticket)} className="font-medium text-lemon hover:underline">View/Reply</button>
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
