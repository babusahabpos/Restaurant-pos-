
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
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] overflow-hidden bg-black -m-4 md:-m-8">
            {/* TOP HALF: MENU */}
            <div className="h-1/2 flex flex-col p-4 border-b border-gray-800 overflow-hidden">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition ${activeCategory === category ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-400'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-y-auto pr-1">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-2 rounded-lg text-center cursor-pointer border border-gray-800 active:scale-95 transition flex flex-col justify-center min-h-[70px]">
                           <p className="text-[10px] text-white font-bold leading-tight line-clamp-2 mb-1">{item.name}</p>
                           <p className="text-lemon text-[10px] font-bold">₹{item.onlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM HALF: LOGGING */}
            <div className="h-1/2 flex flex-col p-4 bg-gray-950 overflow-hidden">
                <div className="flex gap-2 mb-3">
                    <select 
                        value={platform}
                        onChange={e => setPlatform(e.target.value as 'Swiggy' | 'Zomato')}
                        className="flex-1 bg-gray-900 text-white text-xs p-2 rounded border border-gray-800"
                    >
                        <option>Swiggy</option>
                        <option>Zomato</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Order ID" 
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        className="flex-1 bg-gray-900 text-white text-xs p-2 rounded border border-gray-800" 
                    />
                </div>

                <div className="flex-1 overflow-y-auto mb-2 space-y-1">
                    {currentOrder.length === 0 && <p className="text-gray-600 text-center py-4 text-xs">Add items from menu above</p>}
                    {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-black/40 p-2 rounded">
                            <p className="text-xs text-white truncate w-1/3">{item.name}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white">-</button>
                                <span className="text-xs text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white">+</button>
                            </div>
                            <p className="text-xs text-lemon font-bold w-20 text-right">₹{(item.onlinePrice * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Payable</span>
                        <span className="text-lg text-lemon font-black">₹{total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleSendToKitchen} 
                        className="bg-lemon text-black font-black px-8 py-3 rounded-lg text-xs active:scale-95 transition disabled:opacity-50"
                        disabled={currentOrder.length === 0 || !orderId.trim()}
                    >
                        SAVE ONLINE ORDER
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnlineOrders;
