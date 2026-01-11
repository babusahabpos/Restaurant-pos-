
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
            alert('Product added!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-900 p-1.5 rounded-2xl border border-gray-800 shrink-0">
                <button onClick={() => setView('products')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'products' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>Market Products</button>
                <button onClick={() => setView('orders')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'orders' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}>User Orders ({orders.length})</button>
            </div>

            {view === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 h-fit">
                        <h4 className="text-white font-black uppercase text-sm mb-6">Create Product</h4>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input placeholder="Name" className="w-full bg-black text-lemon p-3.5 rounded-xl border border-gray-800 outline-none font-bold" value={name} onChange={e => setName(e.target.value)} required />
                            <input placeholder="Price" type="number" className="w-full bg-black text-lemon p-3.5 rounded-xl border border-gray-800 outline-none font-bold" value={price} onChange={e => setPrice(e.target.value)} required />
                            <textarea placeholder="Description" className="w-full bg-black text-lemon p-3.5 rounded-xl border border-gray-800 outline-none font-bold" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase px-1">Product Photo</p>
                                <div className="flex items-center gap-4">
                                    {image && <img src={image} className="w-16 h-16 object-cover rounded-xl border-2 border-lemon" />}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-[10px] text-gray-500 file:bg-gray-800 file:text-lemon file:border-0 file:py-1.5 file:px-4 file:rounded-full" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-[10px] tracking-widest shadow-xl shadow-lemon/10 active:scale-95">Publish Item</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(p => (
                            <div key={p.id} className="bg-black p-4 rounded-[2rem] border border-gray-800 flex items-center gap-4 relative group">
                                {p.image ? <img src={p.image} className="w-20 h-20 object-cover rounded-2xl" /> : <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-700 text-[8px] font-black uppercase">No Pic</div>}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black uppercase text-sm truncate">{p.name}</h4>
                                    <p className="text-lemon font-black text-xs mt-1">₹{p.price}</p>
                                </div>
                                <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
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
                            <div key={order.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-5 flex-1 w-full">
                                    {product?.image ? <img src={product.image} className="w-20 h-20 object-cover rounded-2xl border-2 border-lemon shadow-xl" /> : <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-gray-700 text-[8px] font-black uppercase">No Pic</div>}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] bg-lemon text-black px-2 py-0.5 rounded-full font-black uppercase">{order.status}</span>
                                            <span className="text-[8px] text-gray-500 font-black">{new Date(order.timestamp).toLocaleString()}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-white uppercase">{order.productName}</h4>
                                        <p className="text-lemon font-black text-xs uppercase mt-0.5">{order.restaurantName} • QTY: {order.quantity}</p>
                                        <p className="text-white font-black text-sm mt-1">Total Bill: ₹{order.price * order.quantity}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <button onClick={() => onMessageUser(order.userId, `Regarding your ${order.productName} order: `)} className="bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl text-[9px] uppercase active:scale-95">Send Notice</button>
                                    <a href={`tel:${order.id}`} className="bg-gray-800 text-white font-black px-6 py-2.5 rounded-xl text-[9px] text-center uppercase border border-gray-700 active:scale-95">Call Owner</a>
                                </div>
                            </div>
                        );
                    }) : <div className="py-20 text-center opacity-30 text-xs font-black uppercase tracking-widest">No marketplace activity</div>}
                </div>
            )}
        </div>
    );
};

export default MarketManagement;
