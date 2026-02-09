
import React, { useState, useEffect, useRef } from 'react';
import { MarketplaceProduct, MarketplaceOrder, RegisteredUser, TicketMessage } from '../types';

interface MarketProps {
    products: MarketplaceProduct[];
    orders: MarketplaceOrder[];
    onPlaceOrder: (productId: number, productName: string, price: number, quantity: number) => void;
    onCancelOrder: (orderId: number) => void;
    onSendMessage: (orderId: number, text: string, sender: 'user' | 'admin') => void;
    user: RegisteredUser;
}

const OrderChatModal: React.FC<{
    order: MarketplaceOrder;
    onClose: () => void;
    onSend: (text: string) => void;
}> = ({ order, onClose, onSend }) => {
    const [msg, setMsg] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [order.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msg.trim()) return;
        onSend(msg);
        setMsg('');
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[150] p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-[2.5rem] flex flex-col h-[70vh] shadow-2xl animate-fade-in overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-white font-black uppercase text-sm tracking-tighter">Support: {order.productName}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Order ID: #{order.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl font-black">&times;</button>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 bg-black/20">
                    {(order.messages || []).length > 0 ? (
                        order.messages?.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl max-w-[85%] ${m.sender === 'user' ? 'bg-lemon text-black rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none'}`}>
                                    <p className="text-xs font-bold leading-relaxed">{m.text}</p>
                                </div>
                                <span className="text-[8px] text-gray-600 font-black uppercase mt-1 px-1">
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4 grayscale">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                            <p className="font-black uppercase text-[10px] tracking-widest">Ask admin about this order</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-white/5 flex gap-2 items-center">
                    <input 
                        value={msg} onChange={e => setMsg(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none text-xs font-bold"
                    />
                    <button type="submit" className="bg-lemon text-black p-4 rounded-2xl active:scale-95 transition-transform shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

const Market: React.FC<MarketProps> = ({ products, orders, onPlaceOrder, onCancelOrder, onSendMessage, user }) => {
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [chatOrder, setChatOrder] = useState<MarketplaceOrder | null>(null);

    const updateQty = (id: number, delta: number) => {
        const current = quantities[id] || 1;
        setQuantities({ ...quantities, [id]: Math.max(1, current + delta) });
    };

    const handleOrder = (product: MarketplaceProduct) => {
        const qty = quantities[product.id] || 1;
        onPlaceOrder(product.id, product.name, product.price, qty);
        alert(`Order for ${product.name} placed! Track progress in the yellow box above.`);
    };

    // Sort to show newest first and all orders por-por
    const sortedOrders = [...orders].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6 h-full flex flex-col p-2 md:p-0 animate-fade-in overflow-hidden">
            {chatOrder && <OrderChatModal order={chatOrder} onClose={() => setChatOrder(null)} onSend={(t) => onSendMessage(chatOrder.id, t, 'user')} />}
            
            <div className="bg-lemon text-black p-4 rounded-2xl flex justify-between items-center shrink-0 shadow-xl shadow-lemon/10">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black uppercase tracking-tighter leading-none italic">Marketing Hub</h2>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">Supplies & Hardware Store</p>
                </div>
                <div className="bg-black/10 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
                {/* ORDER HISTORY - Yellow Box with multiple orders por-por */}
                {sortedOrders.length > 0 && (
                    <div className="bg-lemon border-4 border-lemon/40 p-5 rounded-[2.5rem] space-y-4 shadow-2xl animate-fade-in mx-1">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-black font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                                </span>
                                My Orders Tracking
                            </h3>
                            <span className="text-[8px] font-black text-black/60 uppercase">{sortedOrders.length} active items</span>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {sortedOrders.map((order, idx) => (
                                <div key={`order-history-${order.id}-${idx}`} className="min-w-[280px] bg-black p-6 rounded-[2.2rem] border border-black/10 shadow-xl relative overflow-hidden group">
                                    <div className="flex flex-col h-full justify-between gap-5">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase ${
                                                    order.status === 'Cancelled' ? 'bg-red-900 text-red-100' : 
                                                    order.status === 'Out of Stock' ? 'bg-orange-600 text-white' :
                                                    order.status === 'Delivered' ? 'bg-green-900 text-green-100' : 'bg-lemon text-black'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-[8px] text-gray-600 font-bold uppercase">{new Date(order.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="text-white font-black uppercase text-sm leading-tight line-clamp-1">{order.productName}</h4>
                                            <p className="text-lemon font-bold text-[10px] mt-1 uppercase tracking-widest">Qty: {order.quantity} • Bill: ₹{order.price * order.quantity}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className={`p-3 rounded-xl border ${order.status === 'Out of Stock' ? 'bg-orange-900/10 border-orange-900/30' : 'bg-white/5 border-white/10'}`}>
                                                 <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1 italic">Schedule</p>
                                                 <p className={`font-black text-xs uppercase tracking-tighter ${order.status === 'Out of Stock' ? 'text-orange-500' : 'text-white'}`}>
                                                     {order.status === 'Out of Stock' ? 'Not Available' : (order.deliveryDate || 'Processing...')}
                                                 </p>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setChatOrder(order)}
                                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-2.5 rounded-xl text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                                    Chat
                                                </button>
                                                {(order.status === 'Pending' || order.status === 'Accepted') && (
                                                    <button 
                                                        onClick={() => { if(window.confirm('Cancel this request?')) onCancelOrder(order.id); }}
                                                        className="flex-1 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 font-black py-2.5 rounded-xl text-[9px] uppercase tracking-widest transition-all active:scale-95"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PRODUCT LIST */}
                <div className="px-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden group hover:border-lemon/30 transition-all shadow-lg flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                            {product.image ? (
                                <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                            ) : (
                                <div className="w-full h-full bg-black/40 flex flex-col items-center justify-center text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                                <p className="text-lemon font-black text-xs">₹{product.price}</p>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight truncate">{product.name}</h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 line-clamp-2 italic">"{product.description}"</p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between bg-black/40 p-1 rounded-xl border border-gray-800">
                                    <button onClick={() => updateQty(product.id, -1)} className="w-10 h-10 rounded-lg bg-gray-800 text-white font-black hover:bg-gray-700 active:scale-90 transition-all">-</button>
                                    <span className="text-lg font-black text-lemon">{quantities[product.id] || 1}</span>
                                    <button onClick={() => updateQty(product.id, 1)} className="w-10 h-10 rounded-lg bg-lemon text-black font-black hover:bg-lemon-dark active:scale-90 transition-all">+</button>
                                </div>
                                <button 
                                    onClick={() => handleOrder(product)}
                                    className="w-full bg-white text-black font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                                >
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export default Market;
