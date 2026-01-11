
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
    const [view, setView] = useState<'inbox' | 'compose'>('inbox');

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
        setView('inbox');
        alert('Message sent to Admin Hub!');
    };
    
    const getStatusChip = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sent</span>;
            case 'Pending': return <span className="bg-lemon text-black px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">New Reply</span>;
            case 'Resolved': return <span className="bg-gray-800 text-gray-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">Closed</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">MESSAGE HUB</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin Chat & Support</p>
                </div>
                <button 
                    onClick={() => setView(view === 'inbox' ? 'compose' : 'inbox')}
                    className="bg-lemon text-black font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-transform"
                >
                    {view === 'inbox' ? 'New Message' : 'Back to Inbox'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {view === 'compose' ? (
                    <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800 animate-fade-in shadow-2xl">
                        <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tighter">Compose New Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <select 
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 focus:border-lemon outline-none font-bold text-sm"
                                required
                            >
                                <option value="">Select Topic</option>
                                <option value="Renewal Request">Subscription Renewal</option>
                                <option value="Menu Sync Issue">Menu & Pricing</option>
                                <option value="Order Dispute">Order & Payment</option>
                                <option value="Staff Hub Query">Staff Requirement</option>
                                <option value="General Support">Other Support</option>
                            </select>
                            <textarea 
                                placeholder="Write your message to the Admin..." 
                                rows={5}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full bg-black text-white p-4 rounded-2xl border border-gray-800 focus:border-lemon outline-none font-bold text-sm" 
                                required
                            />
                            
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <label className="w-full sm:w-auto bg-gray-800 text-gray-300 px-6 py-3 rounded-xl cursor-pointer hover:bg-gray-700 border border-gray-700 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    {fileName ? fileName : 'Attach Proof'}
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                                </label>
                                {fileName && <button type="button" onClick={() => { setAttachment(null); setFileName(''); }} className="text-red-500 font-black text-[9px] uppercase">Remove</button>}
                            </div>

                            <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] hover:bg-lemon-dark transition shadow-xl shadow-lemon/10 uppercase text-xs tracking-widest mt-4">
                                Send Message
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userTickets.length === 0 ? (
                            <div className="py-24 text-center opacity-30 flex flex-col items-center grayscale">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                <p className="font-black uppercase text-xs tracking-widest">No messages found</p>
                            </div>
                        ) : (
                            userTickets.slice().reverse().map(ticket => (
                                <details key={ticket.id} className="bg-gray-900 border border-gray-800 rounded-[2rem] overflow-hidden group transition-all open:border-lemon/30 shadow-lg">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                {getStatusChip(ticket.status)}
                                                <span className="text-[10px] text-gray-500 font-black uppercase">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="text-base font-black text-white uppercase tracking-tighter mt-1">{ticket.subject}</h4>
                                        </div>
                                        <svg className="w-6 h-6 text-gray-600 transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <div className="p-6 pt-0 border-t border-gray-800/50 bg-black/20 space-y-4">
                                       {ticket.messages.map((msg, index) => (
                                           <div key={index} className={`flex flex-col ${msg.sender === 'admin' ? 'items-start' : 'items-end'}`}>
                                               <div className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'admin' ? 'bg-lemon text-black rounded-tl-none' : 'bg-gray-800 text-white rounded-tr-none'}`}>
                                                   <p className="text-xs font-bold leading-relaxed">{msg.text}</p>
                                                   {msg.attachment && (
                                                        <div className="mt-3">
                                                            {msg.attachmentType === 'image' ? (
                                                                <img src={msg.attachment} alt="Attachment" className="max-h-48 rounded-xl border border-black/10 shadow-lg" />
                                                            ) : (
                                                                <a href={msg.attachment} download="attachment.pdf" className={`text-[10px] font-black uppercase underline ${msg.sender === 'admin' ? 'text-black' : 'text-lemon'}`}>Download PDF</a>
                                                            )}
                                                        </div>
                                                   )}
                                               </div>
                                               <p className="text-[8px] text-gray-500 font-black uppercase mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                           </div>
                                       ))}
                                    </div>
                                </details>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpAndSupport;
