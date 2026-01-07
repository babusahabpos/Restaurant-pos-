
import React, { useState } from 'react';
import { MarketplaceProduct, RegisteredUser } from '../types';

interface MarketProps {
    products: MarketplaceProduct[];
    onPlaceOrder: (productId: number, productName: string, price: number, quantity: number) => void;
    user: RegisteredUser;
}

const Market: React.FC<MarketProps> = ({ products, onPlaceOrder, user }) => {
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const updateQty = (id: number, delta: number) => {
        const current = quantities[id] || 1;
        setQuantities({ ...quantities, [id]: Math.max(1, current + delta) });
    };

    const handleOrder = (product: MarketplaceProduct) => {
        const qty = quantities[product.id] || 1;
        onPlaceOrder(product.id, product.name, product.price, qty);
        alert(`Order for ${product.name} placed successfully! Admin will confirm delivery date soon.`);
    };

    return (
        <div className="space-y-6 h-full flex flex-col p-2 md:p-0">
            <div className="bg-lemon text-black p-4 rounded-2xl flex justify-between items-center shrink-0 shadow-xl shadow-lemon/10">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">MARKETPLACE</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Premium Add-ons for your Business</p>
                </div>
                <div className="bg-black/10 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
                {products.length > 0 ? products.map(product => (
                    <div key={product.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-lemon/30 transition-all shadow-lg">
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{product.name}</h3>
                            <p className="text-lemon font-black text-lg mt-1 tracking-widest">₹{product.price}</p>
                            <p className="text-gray-500 text-xs mt-2 font-bold uppercase leading-relaxed italic">"{product.description}"</p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4 bg-black/40 p-4 rounded-3xl border border-gray-800 w-full sm:w-auto">
                            <div className="flex items-center gap-4">
                                <button onClick={() => updateQty(product.id, -1)} className="w-10 h-10 rounded-full bg-gray-800 text-white font-black hover:bg-gray-700 active:scale-90 transition-all">-</button>
                                <span className="text-lg font-black text-lemon w-6 text-center">{quantities[product.id] || 1}</span>
                                <button onClick={() => updateQty(product.id, 1)} className="w-10 h-10 rounded-full bg-lemon text-black font-black hover:bg-lemon-dark active:scale-90 transition-all">+</button>
                            </div>
                            <button 
                                onClick={() => handleOrder(product)}
                                className="w-full bg-white text-black font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                        <p className="text-gray-500 font-black uppercase text-xs tracking-widest">Market is coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Market;
