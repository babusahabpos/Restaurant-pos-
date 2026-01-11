
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
        <div className="flex flex-col h-full bg-black overflow-hidden relative">
            <div className="h-[42%] flex flex-col p-2 border-b border-gray-800 overflow-hidden shrink-0">
                <div className="flex gap-1 mb-1.5 overflow-x-auto no-scrollbar items-center h-8">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-3 h-6 text-[8px] font-black rounded-full whitespace-nowrap transition-all uppercase ${activeCategory === category ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon border border-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 overflow-y-auto no-scrollbar flex-1 pb-1">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-1.5 rounded-lg text-center cursor-pointer border border-gray-800 active:bg-gray-700 transition-all flex flex-col justify-center min-h-[50px] shadow-lg">
                           <p className="text-[8px] text-white font-black leading-tight line-clamp-2 uppercase tracking-tighter">{item.name}</p>
                           <p className="text-lemon text-[9px] font-black">₹{item.onlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col p-2 bg-gray-950 overflow-hidden pb-[110px]">
                <div className="flex gap-1.5 mb-2 shrink-0">
                    <select 
                        value={platform}
                        onChange={e => setPlatform(e.target.value as 'Swiggy' | 'Zomato')}
                        className="flex-1 bg-gray-900 text-lemon text-[9px] font-black p-2 rounded-lg border border-gray-800 outline-none focus:border-lemon uppercase"
                    >
                        <option>Swiggy</option>
                        <option>Zomato</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="ORDER ID" 
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        className="flex-1 bg-gray-900 text-lemon text-[9px] font-bold p-2 rounded-lg border border-gray-800 outline-none focus:border-lemon uppercase" 
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 bg-black/40 rounded-xl p-1 no-scrollbar border border-gray-900">
                    {currentOrder.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-lemon opacity-10 italic text-[10px] uppercase font-black">Empty</div>
                    ) : (
                        currentOrder.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-white/5 p-1.5 rounded-lg border border-white/5">
                                <div className="min-w-0 flex-1 pr-2">
                                    <p className="text-[9px] text-lemon font-bold truncate uppercase">{item.name}</p>
                                    <p className="text-[7px] text-gray-500 font-mono">₹{item.onlinePrice}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-800 text-white text-[10px]">-</button>
                                    <span className="text-[9px] text-lemon font-black min-w-[12px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-gray-800 text-white text-[10px]">+</button>
                                </div>
                                <p className="text-[9px] text-lemon font-black min-w-[30px] text-right tracking-tighter">₹{(item.onlinePrice * item.quantity).toFixed(0)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-900 border-t border-gray-800 flex flex-col gap-1.5 z-40">
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-gray-500 uppercase font-black mb-0.5">EST. TOTAL</span>
                        <span className="text-xl text-lemon font-black tracking-tighter">₹{total.toFixed(0)}</span>
                    </div>
                </div>
                <button 
                    onClick={handleSendToKitchen} 
                    className="w-full bg-lemon text-black font-black py-3 rounded-xl text-[10px] uppercase active:scale-95 disabled:opacity-20"
                    disabled={currentOrder.length === 0 || !orderId.trim()}
                >
                    GENERATE ONLINE KOT
                </button>
            </div>
        </div>
    );
};

export default OnlineOrders;
