
import React, { useState } from 'react';
import { SupportTicket } from '../types';

const HelpAndSupport: React.FC<{ 
    userTickets: SupportTicket[];
    onCreateTicket: (subject: string, message: string, attachment?: string, attachmentType?: 'image' | 'pdf') => void;
}> = ({ userTickets, onCreateTicket }) => {

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [attachmentType, setAttachmentType] = useState<'image' | 'pdf' | undefined>(undefined);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large. Max 2MB allowed.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setAttachment(result);
                setFileName(file.name);
                if (file.type.includes('pdf')) {
                    setAttachmentType('pdf');
                } else {
                    setAttachmentType('image');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            alert('Please fill out both subject and message.');
            return;
        }
        onCreateTicket(subject, message, attachment || undefined, attachmentType);
        setSubject('');
        setMessage('');
        setAttachment(null);
        setFileName('');
        setAttachmentType(undefined);
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
            <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Contact Support</h3>
                 <p className="mb-4 text-gray-400">If you have an issue, please create a ticket below.</p>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <input 
                        type="text" 
                        placeholder="Subject" 
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700" 
                        required 
                    />
                     <textarea 
                        placeholder="Describe your issue..." 
                        rows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700" 
                        required
                    />
                    
                    <div className="flex items-center gap-4">
                        <label className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 border border-gray-600 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                            {fileName ? fileName : 'Upload Screenshot/PDF'}
                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                        </label>
                        {fileName && <button type="button" onClick={() => { setAttachment(null); setFileName(''); }} className="text-red-400 text-sm">Remove</button>}
                    </div>

                     <div className="flex justify-end">
                         <button type="submit" className="bg-lemon text-black font-bold py-2 px-6 rounded-lg hover:bg-lemon-dark">
                            Create Ticket
                        </button>
                     </div>
                 </form>
            </div>

            <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Your Support Tickets</h3>
                <div className="space-y-4">
                    {userTickets.length === 0 ? (
                        <p className="text-gray-500">You have no support tickets.</p>
                    ) : (
                        userTickets.map(ticket => (
                            <details key={ticket.id} className="p-4 bg-gray-800 rounded-lg group border border-gray-700">
                                <summary className="flex items-center justify-between font-semibold text-gray-200 cursor-pointer">
                                    <span>{ticket.subject}</span>
                                    <div className="flex items-center gap-4">
                                        {getStatusChip(ticket.status)}
                                        <svg className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                                   {ticket.messages.map((msg, index) => (
                                       <div key={index} className={`p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-lemon/10' : 'bg-gray-700'}`}>
                                           <p className="text-sm text-gray-200">{msg.text}</p>
                                           {msg.attachment && (
                                                <div className="mt-2">
                                                    {msg.attachmentType === 'image' ? (
                                                        <img src={msg.attachment} alt="Attachment" className="max-h-32 rounded border border-gray-600" />
                                                    ) : (
                                                        <a href={msg.attachment} download="attachment.pdf" className="text-blue-400 underline text-sm">Download PDF Attachment</a>
                                                    )}
                                                </div>
                                           )}
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
