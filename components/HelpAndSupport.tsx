
import React, { useState } from 'react';
import { SupportTicket } from '../types';

interface HelpAndSupportProps {
    userTickets: SupportTicket[];
    onCreateTicket: (subject: string, message: string, attachment?: string, attachmentType?: 'image' | 'pdf') => void;
    onReplyToTicket?: (ticketId: number, message: string) => void;
}

const HelpAndSupport: React.FC<HelpAndSupportProps> = ({ userTickets, onCreateTicket, onReplyToTicket }) => {
    const [view, setView] = useState<'inbox' | 'compose' | 'chat'>('inbox');
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [chatReply, setChatReply] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [attachmentType, setAttachmentType] = useState<'image' | 'pdf' | undefined>(undefined);
    const [fileName, setFileName] = useState('');

    const activeTicket = userTickets.find(t => t.id === selectedTicketId);

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
                setAttachmentType(file.type.includes('pdf') ? 'pdf' : 'image');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;
        onCreateTicket(subject, message, attachment || undefined, attachmentType);
        setSubject(''); setMessage(''); setAttachment(null); setFileName(''); setAttachmentType(undefined);
        setView('inbox');
        alert('Message sent to Admin Hub!');
    };

    const handleSendReply = () => {
        if (!chatReply.trim() || !selectedTicketId || !onReplyToTicket) return;
        onReplyToTicket(selectedTicketId, chatReply);
        setChatReply('');
    };

    const getStatusChip = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Sent</span>;
            case 'Pending': return <span className="bg-lemon text-black px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Admin Replied</span>;
            case 'Resolved': return <span className="bg-gray-800 text-gray-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Closed</span>;
        }
    };

    if (view === 'compose') {
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">NEW TICKET</h2>
                    <button onClick={() => setView('inbox')} className="text-lemon font-black text-[10px] uppercase tracking-widest">Cancel</button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800 animate-fade-in shadow-2xl">
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <select 
                                value={subject} onChange={e => setSubject(e.target.value)}
                                className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" required
                            >
                                <option value="">Select Topic</option>
                                <option value="Renewal Request">Subscription Renewal</option>
                                <option value="Menu Sync Issue">Menu & Pricing</option>
                                <option value="Order Dispute">Order & Payment</option>
                                <option value="Staff Hub Query">Staff Requirement</option>
                                <option value="General Support">Other Support</option>
                            </select>
                            <textarea 
                                placeholder="Describe your issue..." rows={5} value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" required
                            />
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <label className="w-full sm:w-auto bg-gray-800 text-gray-300 px-6 py-3 rounded-xl cursor-pointer border border-gray-700 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    {fileName ? fileName : 'Attach File'}
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                                </label>
                                {fileName && <button type="button" onClick={() => { setAttachment(null); setFileName(''); }} className="text-red-500 font-black text-[9px] uppercase">Remove</button>}
                            </div>
                            <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase text-xs tracking-widest shadow-xl shadow-lemon/20">Send to Admin</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'chat' && activeTicket) {
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('inbox')} className="text-gray-400 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px]">{activeTicket.subject}</h2>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">ID: #{activeTicket.id}</p>
                        </div>
                    </div>
                    {getStatusChip(activeTicket.status)}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-4 px-2">
                    {activeTicket.messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === 'admin' ? 'items-start' : 'items-end'}`}>
                            <div className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'admin' ? 'bg-lemon text-black rounded-tl-none shadow-lg' : 'bg-gray-800 text-white rounded-tr-none'}`}>
                                <p className="text-[11px] font-bold leading-relaxed">{msg.text}</p>
                                {msg.attachment && (
                                    <div className="mt-3">
                                        {msg.attachmentType === 'image' ? (
                                            <img src={msg.attachment} alt="Attachment" className="max-h-48 rounded-xl border border-black/10 shadow-md" />
                                        ) : (
                                            <a href={msg.attachment} download="file.pdf" className={`text-[9px] font-black uppercase underline ${msg.sender === 'admin' ? 'text-black' : 'text-lemon'}`}>View Document</a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className="text-[8px] text-gray-600 font-black uppercase mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ))}
                </div>

                {activeTicket.status !== 'Resolved' && (
                    <div className="mt-4 bg-gray-900 p-2 rounded-2xl border border-gray-800 flex items-end gap-2 pb-16 md:pb-2 shadow-2xl">
                        <textarea 
                            value={chatReply} onChange={e => setChatReply(e.target.value)}
                            placeholder="Type a message..." rows={1}
                            className="flex-1 bg-black text-white p-3 rounded-xl outline-none font-bold text-xs resize-none"
                        />
                        <button 
                            onClick={handleSendReply}
                            className="bg-lemon text-black p-3 rounded-xl active:scale-95 transition-transform shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </button>
                    </div>
                )}
                {activeTicket.status === 'Resolved' && (
                    <div className="text-center py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest border-t border-gray-800 mt-4">This chat is closed</div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">MESSAGE HUB</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Inbox: {userTickets.length}</p>
                </div>
                <button 
                    onClick={() => setView('compose')}
                    className="bg-lemon text-black font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-transform"
                >
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-3">
                {userTickets.length === 0 ? (
                    <div className="py-24 text-center opacity-30 flex flex-col items-center grayscale">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                        <p className="font-black uppercase text-xs tracking-widest">No messages found</p>
                    </div>
                ) : (
                    userTickets.slice().reverse().map(ticket => (
                        <div 
                            key={ticket.id} 
                            onClick={() => { setSelectedTicketId(ticket.id); setView('chat'); }}
                            className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] cursor-pointer hover:border-lemon/30 transition-all shadow-md group relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    {getStatusChip(ticket.status)}
                                    <span className="text-[9px] text-gray-600 font-black uppercase">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-700 group-hover:text-lemon transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                            <h3 className="text-white font-black text-sm uppercase tracking-tighter leading-tight line-clamp-1">{ticket.subject}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 truncate">
                                {ticket.messages[ticket.messages.length - 1].sender === 'admin' ? 'Admin: ' : 'You: '}
                                {ticket.messages[ticket.messages.length - 1].text}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HelpAndSupport;
