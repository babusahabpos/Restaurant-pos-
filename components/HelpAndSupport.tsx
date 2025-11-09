import React, { useState } from 'react';
import { SupportTicket } from '../types';

const HelpAndSupport: React.FC<{ 
    userTickets: SupportTicket[];
    onCreateTicket: (subject: string, message: string) => void;
}> = ({ userTickets, onCreateTicket }) => {

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            alert('Please fill out both subject and message.');
            return;
        }
        onCreateTicket(subject, message);
        setSubject('');
        setMessage('');
        alert('Support ticket created successfully!');
    };
    
    const getStatusChip = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return <span className="text-blue-400">Open</span>;
            case 'Pending': return <span className="text-lemon">Admin Replied</span>;
            case 'Resolved': return <span className="text-green-400">Resolved</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-6 bg-black rounded-lg shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Contact Support</h3>
                 <p className="mb-4 text-gray-400">If you have an issue, please create a ticket below.</p>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <input 
                        type="text" 
                        placeholder="Subject" 
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800" 
                        required 
                    />
                     <textarea 
                        placeholder="Describe your issue..." 
                        rows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800" 
                        required
                    />
                     <div className="flex justify-end">
                         <button type="submit" className="bg-lemon text-black font-bold py-2 px-6 rounded-lg hover:bg-lemon-dark">
                            Create Ticket
                        </button>
                     </div>
                 </form>
            </div>

            <div className="p-6 bg-black rounded-lg shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Your Support Tickets</h3>
                <div className="space-y-4">
                    {userTickets.length === 0 ? (
                        <p className="text-gray-500">You have no support tickets.</p>
                    ) : (
                        userTickets.map(ticket => (
                            <details key={ticket.id} className="p-4 bg-gray-900 rounded-lg group border border-gray-800">
                                <summary className="flex items-center justify-between font-semibold text-gray-200 cursor-pointer">
                                    <span>{ticket.subject}</span>
                                    <div className="flex items-center gap-4">
                                        {getStatusChip(ticket.status)}
                                        <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                                   {ticket.messages.map((msg, index) => (
                                       <div key={index} className={`p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-lemon/10' : 'bg-gray-800'}`}>
                                           <p className="text-sm text-gray-200">{msg.text}</p>
                                           <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                                       </div>
                                   ))}
                                </div>
                            </details>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpAndSupport;