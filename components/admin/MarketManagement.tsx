
import React, { useState } from 'react';
import { MarketplaceProduct, MarketplaceOrder } from '../../types';

interface MarketManagementProps {
    products: MarketplaceProduct[];
    orders: MarketplaceOrder[];
    onAddProduct: (name: string, price: number, desc: string, image?: string) => void;
    onDeleteProduct: (id: number) => void;
    onMessageUser: (userId: number, message: string) => void;
}

const MarketManagement: React.FC<MarketManagementProps> = ({ products, orders, onAddProduct, onDeleteProduct, onMessageUser }) => {
    const [view, setView] = useState<'products' | 'orders'>('products');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState<string | undefined>(undefined);
    
    const [msgModal, setMsgModal] = useState<{ id: number; name: string } | null>(null);
    const [msgText, setMsgText] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && price) {
            onAddProduct(name, parseFloat(price), desc, image);
            setName(''); setPrice(''); setDesc(''); setImage(undefined);
            alert('Product added successfully!');
        }
    };

    const handleSendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (msgModal && msgText.trim()) {
            onMessageUser(msgModal.id, msgText);
            setMsgText('');
            setMsgModal(null);
            alert('Message sent to user!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800">
                <button onClick={() => setView('products')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'products' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Manage Products</button>
                <button onClick={() => setView('orders')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'orders' ? 'bg-lemon text-black' : 'text-gray-400'}`}>User Orders ({orders.length})</button>
            </div>

            {view === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit">
                        <h4 className="text-white font-black uppercase text-sm mb-6">Publish New Item</h4>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input placeholder="Product Name" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={name} onChange={e => setName(e.target.value)} required />
                            <input placeholder="Price (₹)" type="number" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={price} onChange={e => setPrice(e.target.value)} required />
                            <textarea placeholder="Description" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upload Photo</label>
                                <div className="flex flex-col items-center gap-4">
                                    {image && <img src={image} className="w-24 h-24 object-cover rounded-xl border border-lemon shadow-lg" />}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-[10px] text-gray-400 file:bg-gray-800 file:text-lemon file:border-0 file:py-2 file:px-4 file:rounded-full cursor-pointer" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-xl shadow-lemon/10">Publish Product</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {products.map(p => (
                            <div key={p.id} className="bg-black p-5 rounded-3xl border border-gray-800 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    {p.image ? (
                                        <img src={p.image} className="w-20 h-20 object-cover rounded-2xl shadow-md border border-white/5" />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-700 font-black text-[10px]">NO PIC</div>
                                    )}
                                    <div>
                                        <h4 className="text-white font-black uppercase text-lg">{p.name}</h4>
                                        <p className="text-lemon font-black tracking-widest mt-1">₹{p.price}</p>
                                        <p className="text-gray-500 text-[10px] mt-1 font-bold uppercase">{p.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:bg-red-500/10 p-4 rounded-2xl transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'orders' && (
                <div className="space-y-4">
                    {orders.length > 0 ? orders.map(order => {
                        const product = products.find(p => p.id === order.productId);
                        return (
                            <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-lemon/30 transition-all">
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className="shrink-0">
                                        {product?.image ? (
                                            <img src={product.image} className="w-24 h-24 object-cover rounded-2xl shadow-xl border-2 border-lemon" />
                                        ) : (
                                            <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center text-gray-800 font-black text-[10px] uppercase">Photo Missing</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[8px] bg-lemon text-black px-2 py-0.5 rounded-full font-black uppercase">{order.status}</span>
                                            <span className="text-[9px] text-gray-500 font-black">{new Date(order.timestamp).toLocaleString()}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase leading-tight">{order.productName}</h4>
                                        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                                            <div>
                                                <p className="text-[8px] text-gray-500 uppercase font-black">Restaurant</p>
                                                <p className="text-[11px] text-lemon font-bold">{order.restaurantName}</p>
                                                <p className="text-[10px] text-gray-400">{order.userName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] text-gray-500 uppercase font-black">Quantity & Bill</p>
                                                <p className="text-[11px] text-white font-bold">{order.quantity} Units</p>
                                                <p className="text-sm text-lemon font-black">₹{order.price * order.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <button onClick={() => setMsgModal({ id: order.userId, name: order.userName })} className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase shadow-lg active:scale-95 transition-transform">Message Owner</button>
                                    <a href={`tel:${order.id}`} className="bg-gray-800 text-white font-black px-6 py-3 rounded-2xl text-[10px] text-center uppercase border border-gray-700 active:scale-95 transition-transform">Call User</a>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            <p className="font-black uppercase text-xs tracking-widest">No marketplace orders yet</p>
                        </div>
                    )}
                </div>
            )}
            
            {msgModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[150] p-4">
                    <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-800">
                        <h3 className="text-lg font-black text-white uppercase mb-4">Message Owner</h3>
                        <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type your message..." className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 mb-4 outline-none focus:border-lemon" rows={4} />
                        <div className="flex gap-2">
                            <button onClick={() => setMsgModal(null)} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl uppercase text-[10px]">Cancel</button>
                            <button onClick={handleSendMsg} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl uppercase text-[10px]">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketManagement;
