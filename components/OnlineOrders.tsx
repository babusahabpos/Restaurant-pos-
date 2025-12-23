
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
        const newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'> = {
            type: 'Online',
            items: currentOrder,
            total: currentOrder.reduce((acc, item) => acc + item.onlinePrice * item.quantity, 0),
            sourceInfo: `${platform} #${orderId}`
        };
        onPrintKOT(newOrderData);
        alert('Online order logged!');
        setCurrentOrder([]);
        setOrderId('');
    };

    const total = currentOrder.reduce((acc, item) => acc + (Number(item.onlinePrice) || 0) * item.quantity, 0);

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-100px)] overflow-hidden bg-black -m-4 md:-m-8 touch-none">
            {/* TOP HALF: MENU */}
            <div className="h-[45%] flex flex-col p-3 border-b border-gray-800 overflow-hidden">
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 text-[10px] font-black rounded-full whitespace-nowrap transition-all uppercase flex items-center justify-center min-w-[60px] h-8 ${activeCategory === category ? 'bg-lemon text-black ring-2 ring-white/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-y-auto pr-1 flex-1">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-2 rounded-lg text-center cursor-pointer border border-gray-800 active:bg-gray-800 active:scale-95 transition-all flex flex-col justify-center min-h-[65px] select-none">
                           <p className="text-[9px] text-white font-bold leading-tight line-clamp-2 mb-1 uppercase tracking-tighter">{item.name}</p>
                           <p className="text-lemon text-[10px] font-black">₹{item.onlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM HALF: LOGGING */}
            <div className="h-[55%] flex flex-col p-3 bg-gray-950 overflow-hidden shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                <div className="flex gap-2 mb-3">
                    <select 
                        value={platform}
                        onChange={e => setPlatform(e.target.value as 'Swiggy' | 'Zomato')}
                        className="flex-1 bg-gray-900 text-white text-[11px] font-black p-2 rounded border border-gray-800 outline-none focus:border-lemon uppercase"
                    >
                        <option>Swiggy</option>
                        <option>Zomato</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="ORDER ID / TRANSACTION #" 
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        className="flex-1 bg-gray-900 text-white text-[11px] font-bold p-2 rounded border border-gray-800 outline-none focus:border-lemon" 
                    />
                </div>

                <div className="flex-1 overflow-y-auto mb-2 space-y-1 bg-black/20 rounded p-1">
                    {currentOrder.length === 0 && <p className="text-gray-700 text-center py-10 text-[10px] font-bold uppercase tracking-widest">Select items to log</p>}
                    {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                            <div className="w-[45%]">
                                <p className="text-[10px] text-white font-bold truncate uppercase">{item.name}</p>
                                <p className="text-[9px] text-gray-500">₹{item.onlinePrice} / unit</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black transition-colors">-</button>
                                <span className="text-[11px] text-white font-bold min-w-[20px] text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black transition-colors">+</button>
                            </div>
                            <p className="text-[11px] text-lemon font-black w-[25%] text-right">₹{(item.onlinePrice * item.quantity).toFixed(0)}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-tight">Logged Total</span>
                        <span className="text-2xl text-lemon font-black tracking-tighter">₹{total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleSendToKitchen} 
                        className="bg-lemon text-black font-black px-6 py-4 rounded-xl text-xs active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale uppercase"
                        disabled={currentOrder.length === 0 || !orderId.trim()}
                    >
                        Save Online Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnlineOrders;
