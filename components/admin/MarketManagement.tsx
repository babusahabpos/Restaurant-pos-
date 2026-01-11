
import React, { useState } from 'react';
import { MarketplaceProduct, MarketplaceOrder } from '../../types';

interface MarketManagementProps {
    products: MarketplaceProduct[];
    orders: MarketplaceOrder[];
    onAddProduct: (name: string, price: number, desc: string, image?: string) => void;
    onDeleteProduct: (id: number) => void;
    onMessageUser: (userId: number, message: string) => void;
    onUpdateStatus: (orderId: number, status: MarketplaceOrder['status']) => void;
    onDeleteOrder: (orderId: number) => void;
}

const MarketManagement: React.FC<MarketManagementProps> = ({ products, orders, onAddProduct, onDeleteProduct, onMessageUser, onUpdateStatus, onDeleteOrder }) => {
    const [view, setView] = useState<'products' | 'orders'>('products');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState<string | undefined>(undefined);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && price) {
            onAddProduct(name, parseFloat(price), desc, image);
            setName(''); setPrice(''); setDesc(''); setImage(undefined);
            alert('Product Published to Market!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-900 p-1.5 rounded-2xl border border-gray-800 shrink-0">
                <button onClick={() => setView('products')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'products' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Inventory Supply</button>
                <button onClick={() => setView('orders')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'orders' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>User Requests ({orders.length})</button>
            </div>

            {view === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 h-fit shadow-2xl">
                        <h4 className="text-white font-black uppercase text-sm mb-6 tracking-tighter">Publish New Item</h4>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input placeholder="Item Name (e.g. Printer Rolls)" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold text-sm" value={name} onChange={e => setName(e.target.value)} required />
                            <input placeholder="Unit Price (₹)" type="number" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold text-sm" value={price} onChange={e => setPrice(e.target.value)} required />
                            <textarea placeholder="Product Description" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold text-sm leading-relaxed" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase px-1 tracking-widest">Upload Item Photo</p>
                                <div className="flex items-center gap-4">
                                    {image && <img src={image} className="w-20 h-20 object-cover rounded-xl border-2 border-lemon shadow-lg" />}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-[9px] text-gray-500 file:bg-gray-800 file:text-lemon file:border-0 file:py-2 file:px-4 file:rounded-full cursor-pointer" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-lemon/10 active:scale-95 transition-transform">Launch to Market</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(p => (
                            <div key={p.id} className="bg-black p-5 rounded-[2.5rem] border border-gray-800 flex items-center gap-5 relative group hover:border-lemon/20 transition-all">
                                {p.image ? <img src={p.image} className="w-24 h-24 object-cover rounded-2xl shadow-xl" /> : <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-700 text-[8px] font-black uppercase">Missing Pic</div>}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-sm truncate">{p.name}</h4>
                                    <p className="text-lemon font-black text-base mt-0.5">₹{p.price}</p>
                                    <p className="text-gray-600 text-[9px] font-bold mt-1 uppercase line-clamp-2">"{p.description}"</p>
                                </div>
                                <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-red-900/10 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'orders' && (
                <div className="space-y-4 pb-10">
                    {orders.length > 0 ? orders.slice().reverse().map(order => {
                        const product = products.find(p => p.id === order.productId);
                        return (
                            <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-lemon/30 transition-all shadow-2xl relative overflow-hidden">
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className="shrink-0 relative">
                                        {product?.image ? (
                                            <img src={product.image} className="w-28 h-28 object-cover rounded-3xl border-2 border-lemon shadow-2xl" />
                                        ) : (
                                            <div className="w-28 h-28 bg-black rounded-3xl flex items-center justify-center text-gray-800 text-[9px] font-black uppercase border border-gray-800">Photo Missing</div>
                                        )}
                                        <div className="absolute -top-2 -right-2 bg-lemon text-black font-black w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-gray-900">
                                            x{order.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter ${order.status === 'Pending' ? 'bg-lemon text-black' : order.status === 'Out of Stock' ? 'bg-red-600 text-white' : order.status === 'Delivered' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>{order.status}</span>
                                            <span className="text-[9px] text-gray-500 font-black uppercase">{new Date(order.timestamp).toLocaleString()}</span>
                                        </div>
                                        <h4 className="text-2xl font-black text-white uppercase leading-tight tracking-tighter">{order.productName}</h4>
                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                                            <div>
                                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Ordering Terminal</p>
                                                <p className="text-xs text-lemon font-black uppercase">{order.restaurantName}</p>
                                                <p className="text-[10px] text-white font-bold">{order.userName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Total Bill Value</p>
                                                <p className="text-xl text-white font-black tracking-tighter">₹{order.price * order.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-56 shrink-0">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => onMessageUser(order.userId, `Regarding ${order.productName}: `)} className="bg-gray-800 text-white font-black py-3 rounded-xl text-[9px] uppercase hover:bg-gray-700 active:scale-95 transition-all">Message</button>
                                        <button onClick={() => onUpdateStatus(order.id, 'Delivered')} className="bg-green-600 text-white font-black py-3 rounded-xl text-[9px] uppercase hover:bg-green-700 active:scale-95 transition-all">Delivery</button>
                                        <button onClick={() => { onUpdateStatus(order.id, 'Out of Stock'); onMessageUser(order.userId, `Sorry, ${order.productName} is currently out of stock.`); }} className="bg-orange-600 text-white font-black py-3 rounded-xl text-[9px] uppercase hover:bg-orange-700 active:scale-95 transition-all">Out Stock</button>
                                        <button onClick={() => { if(window.confirm('Delete this order?')) onDeleteOrder(order.id); }} className="bg-red-900/30 text-red-500 font-black py-3 rounded-xl text-[9px] uppercase border border-red-900/50 active:scale-95 transition-all">Delete</button>
                                    </div>
                                    <a href={`tel:${order.id}`} className="w-full bg-lemon text-black font-black py-3.5 rounded-xl text-[10px] text-center uppercase shadow-lg shadow-lemon/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        Call Owner
                                    </a>
                                </div>
                            </div>
                        );
                    }) : <div className="py-24 text-center opacity-30 flex flex-col items-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg><p className="font-black uppercase text-xs tracking-widest">No order requests found</p></div>}
                </div>
            )}
        </div>
    );
};

export default MarketManagement;