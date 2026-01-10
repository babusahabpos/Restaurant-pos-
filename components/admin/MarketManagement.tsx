
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

    const acceptedOrders = orders.filter(o => o.status === 'Accepted');

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800">
                <button onClick={() => setView('products')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'products' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Manage Products</button>
                <button onClick={() => setView('orders')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'orders' ? 'bg-lemon text-black' : 'text-gray-400'}`}>Accepted User Orders ({acceptedOrders.length})</button>
            </div>

            {view === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit">
                        <h4 className="text-white font-black uppercase text-sm mb-6">Add Marketing Item</h4>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input placeholder="Product Name" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={name} onChange={e => setName(e.target.value)} required />
                            <input placeholder="Price (₹)" type="number" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={price} onChange={e => setPrice(e.target.value)} required />
                            <textarea placeholder="Short Description" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Photo</label>
                                <div className="flex flex-col items-center gap-4">
                                    {image && <img src={image} className="w-20 h-20 object-cover rounded-xl border border-lemon" />}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-gray-800 file:text-lemon hover:file:bg-gray-700" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest">Publish Product</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {products.length > 0 ? products.map(p => (
                            <div key={p.id} className="bg-black p-5 rounded-3xl border border-gray-800 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    {p.image && <img src={p.image} className="w-16 h-16 object-cover rounded-2xl" />}
                                    <div>
                                        <h4 className="text-white font-black uppercase text-lg">{p.name}</h4>
                                        <p className="text-lemon font-black tracking-widest mt-1">₹{p.price}</p>
                                        <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase">{p.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:bg-red-500/10 p-4 rounded-2xl transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        )) : <p className="text-center py-20 text-gray-700 font-black uppercase tracking-widest">No products available</p>}
                    </div>
                </div>
            )}

            {view === 'orders' && (
                <div className="space-y-4">
                    {acceptedOrders.length > 0 ? acceptedOrders.map(order => (
                        <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <span className="text-[8px] bg-green-900 text-green-300 px-3 py-1 rounded-full uppercase font-black">Scheduled for Delivery</span>
                                <h4 className="text-xl font-black text-white uppercase mt-2">{order.productName}</h4>
                                <p className="text-lemon font-bold text-xs">For: {order.restaurantName} ({order.userName})</p>
                                <p className="text-gray-400 text-[10px] font-black uppercase mt-1">Delivery on: <span className="text-white">{order.deliveryDate}</span></p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setMsgModal({ id: order.userId, name: order.userName })} className="bg-blue-600/10 text-blue-400 font-black px-6 py-3 rounded-2xl text-[10px] uppercase border border-blue-600/20">Message User</button>
                                <a href={`tel:${order.id}`} className="bg-lemon text-black font-black px-6 py-3 rounded-2xl text-[10px] uppercase">Call User</a>
                            </div>
                        </div>
                    )) : <p className="text-center py-20 text-gray-700 font-black uppercase tracking-widest">No accepted orders</p>}
                </div>
            )}

            {msgModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[150] p-4">
                    <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-800 animate-fade-in">
                        <h3 className="text-lg font-black text-white uppercase mb-4">Msg to {msgModal.name}</h3>
                        <form onSubmit={handleSendMsg}>
                            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type your message about the order..." className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 mb-4 outline-none focus:border-lemon" rows={4} required />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setMsgModal(null)} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl uppercase text-[10px]">Cancel</button>
                                <button type="submit" className="flex-1 bg-lemon text-black font-black py-4 rounded-xl uppercase text-[10px]">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketManagement;
