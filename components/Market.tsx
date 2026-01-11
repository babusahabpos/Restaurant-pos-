
import React, { useState } from 'react';
import { MarketplaceProduct, RegisteredUser } from '../types';

interface MarketProps {
    products: MarketplaceProduct[];
    onPlaceOrder: (productId: number, productName: string, price: number, quantity: number) => void;
    user: RegisteredUser;
}

const FullScreenPreview: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div 
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all z-[110]"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <img 
            src={imageUrl} 
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-scale-up" 
            alt="Full Preview"
            onClick={(e) => e.stopPropagation()}
        />
        <p className="mt-6 text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Tap anywhere to close</p>
    </div>
);

const Market: React.FC<MarketProps> = ({ products, onPlaceOrder, user }) => {
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
            {previewImage && <FullScreenPreview imageUrl={previewImage} onClose={() => setPreviewImage(null)} />}
            
            <div className="bg-lemon text-black p-4 rounded-2xl flex justify-between items-center shrink-0 shadow-xl shadow-lemon/10">
                <div>
                    {/* Text removed as requested */}
                </div>
                <div className="bg-black/10 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-24">
                {products.map(product => (
                    <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden group hover:border-lemon/30 transition-all shadow-lg flex flex-col">
                        {/* LARGE PRODUCT IMAGE */}
                        <div 
                            className="relative h-64 sm:h-80 overflow-hidden cursor-zoom-in"
                            onClick={() => product.image && setPreviewImage(product.image)}
                        >
                            {product.image ? (
                                <>
                                    <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-full text-white/70">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-black/40 flex flex-col items-center justify-center text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                    <p className="font-black uppercase text-xs mt-2">No Photo Available</p>
                                </div>
                            )}
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="p-6 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{product.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <p className="text-lemon font-black text-2xl tracking-tighter">₹{product.price}</p>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-800 px-2 py-0.5 rounded">Incl. Taxes</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-4 font-bold uppercase leading-relaxed italic border-l-2 border-lemon/30 pl-3">"{product.description}"</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full sm:w-56 shrink-0">
                                <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-2xl border border-gray-800">
                                    <button onClick={() => updateQty(product.id, -1)} className="w-12 h-12 rounded-xl bg-gray-800 text-white font-black hover:bg-gray-700 active:scale-90 transition-all text-xl">-</button>
                                    <span className="text-2xl font-black text-lemon">{quantities[product.id] || 1}</span>
                                    <button onClick={() => updateQty(product.id, 1)} className="w-12 h-12 rounded-xl bg-lemon text-black font-black hover:bg-lemon-dark active:scale-90 transition-all text-xl">+</button>
                                </div>
                                <button 
                                    onClick={() => handleOrder(product)}
                                    className="w-full bg-white text-black font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-white/5 active:scale-95 transition-all"
                                >
                                    Place Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="py-24 text-center opacity-30 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <p className="font-black uppercase text-xs tracking-[0.3em]">Market is currently closed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Market;
