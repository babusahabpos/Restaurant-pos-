
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, OrderStatusItem } from '../types';

interface OnlineOrdersProps {
    onPrintKOT: (order: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'>) => void;
    menuItems: MenuItem[];
}

const OnlineOrders: React.FC<OnlineOrdersProps> = ({ onPrintKOT, menuItems = [] }) => {
    const validMenuItems = useMemo(() => (menuItems || []).filter(item => item && item.name && item.category), [menuItems]);
    const categories = useMemo(() => ['All', ...new Set(validMenuItems.map(item => item.category))], [validMenuItems]);

    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [platform, setPlatform] = useState<'Swiggy' | 'Zomato'>('Swiggy');
    const [orderId, setOrderId] = useState('');

    const filteredMenuItems = validMenuItems.filter(item => 
        item.inStock &&
        (activeCategory === 'All' || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToOrder = (item: MenuItem) => {
        const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
        if (existingItem) {
            updateQuantity(item.id, existingItem.quantity + 1);
        } else {
            setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromOrder(id);
        } else {
            setCurrentOrder(currentOrder.map(item => item.id === id ? { ...item, quantity } : item));
        }
    };

    const removeFromOrder = (id: number) => {
        setCurrentOrder(currentOrder.filter(item => item.id !== id));
    };
    
    const handleSendToKitchen = () => {
        if (currentOrder.length === 0 || !orderId.trim()) return;
        const totalAmount = currentOrder.reduce((acc, item) => acc + item.onlinePrice * item.quantity, 0);
        const newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'> = {
            type: 'Online',
            items: currentOrder,
            total: totalAmount,
            sourceInfo: `${platform} #${orderId}`
        };
        onPrintKOT(newOrderData);
        alert('Online KOT Sent to Kitchen!');
        setCurrentOrder([]);
        setOrderId('');
    };

    const total = currentOrder.reduce((acc, item) => acc + (Number(item.onlinePrice) || 0) * item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-black overflow-hidden select-none relative">
            {/* TOP HALF: MENU */}
            <div className="h-[40%] flex flex-col p-2 border-b border-gray-800 overflow-hidden shrink-0">
                <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar items-center h-10">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 h-8 text-[10px] font-black rounded-full whitespace-nowrap transition-all uppercase ${activeCategory === category ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 overflow-y-auto no-scrollbar flex-1">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-2 rounded-xl text-center cursor-pointer border border-gray-800 active:bg-gray-700 transition-all flex flex-col justify-center min-h-[60px]">
                           <p className="text-[9px] text-white font-bold leading-tight line-clamp-2 uppercase">{item.name}</p>
                           <p className="text-lemon text-[10px] font-black">₹{item.onlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* MIDDLE SECTION: CART & SOURCE INFO */}
            <div className="flex-1 flex flex-col p-2 bg-gray-950 overflow-hidden mb-[110px]">
                <div className="flex gap-2 mb-3 shrink-0">
                    <select 
                        value={platform}
                        onChange={e => setPlatform(e.target.value as 'Swiggy' | 'Zomato')}
                        className="flex-1 bg-gray-900 text-lemon text-[11px] font-black p-2.5 rounded-xl border border-gray-700 outline-none focus:border-lemon uppercase shadow-inner"
                    >
                        <option>Swiggy</option>
                        <option>Zomato</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="ORDER ID / TRAN #" 
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        className="flex-1 bg-gray-900 text-lemon text-[11px] font-bold p-2.5 rounded-xl border border-gray-700 outline-none focus:border-lemon uppercase placeholder:text-gray-700" 
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 bg-black/40 rounded-2xl p-1 no-scrollbar border border-gray-900">
                    {currentOrder.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-lemon opacity-20">
                            <span className="text-[10px] font-black uppercase tracking-widest italic">No Items Added</span>
                        </div>
                    ) : (
                        currentOrder.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                                <div className="w-[45%]">
                                    <p className="text-[10px] text-lemon font-bold truncate uppercase">{item.name}</p>
                                    <p className="text-[9px] text-gray-500 font-mono">₹{item.onlinePrice}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white font-bold">-</button>
                                    <span className="text-[11px] text-lemon font-black min-w-[15px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold">+</button>
                                </div>
                                <p className="text-[11px] text-lemon font-black w-[20%] text-right tracking-tighter">₹{(item.onlinePrice * item.quantity).toFixed(0)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* BOTTOM ACTION BAR: STICKY FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-950 border-t border-gray-800 flex flex-col gap-2 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-30">
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 uppercase font-black">Marketplace Total</span>
                        <span className="text-2xl text-lemon font-black tracking-tighter leading-none">₹{total.toFixed(0)}</span>
                    </div>
                    <div className="text-right">
                         <span className="text-[11px] text-gray-600 font-bold uppercase">{platform} Channel</span>
                    </div>
                </div>
                <button 
                    onClick={handleSendToKitchen} 
                    className="w-full bg-lemon text-black font-black py-4 rounded-2xl text-[12px] uppercase tracking-[0.1em] active:scale-[0.97] transition-all disabled:opacity-20 disabled:grayscale shadow-[0_10px_20px_rgba(255,255,0,0.2)]"
                    disabled={currentOrder.length === 0 || !orderId.trim()}
                >
                    GENERATE ONLINE KOT
                </button>
            </div>
        </div>
    );
};

export default OnlineOrders;
