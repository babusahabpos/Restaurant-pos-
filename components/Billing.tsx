
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, OrderStatusItem } from '../types';

interface BillingProps {
    onPrintKOT: (order: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'>) => void;
    menuItems: MenuItem[];
    taxRate: number;
    restaurantName: string;
    isPrinterEnabled: boolean;
    onToggleStock?: (id: number) => void;
}

const Billing: React.FC<BillingProps> = ({ onPrintKOT, menuItems = [], taxRate, restaurantName, isPrinterEnabled, onToggleStock }) => {
    const validMenuItems = useMemo(() => (menuItems || []).filter(item => item && item.name && item.category), [menuItems]);
    const categories = useMemo(() => ['All', ...new Set(validMenuItems.map(item => item.category))], [validMenuItems]);
    
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [orderSource, setOrderSource] = useState<'Takeaway' | 'Dine-in'>('Takeaway');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState<number>(0);

    const filteredMenuItems = validMenuItems.filter(item => 
        (activeCategory === 'All' || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToOrder = (item: MenuItem) => {
        if (!item.inStock) return;
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
    
    const resetOrder = () => {
        if (window.confirm('Reset current order?')) {
            setCurrentOrder([]);
            setTableNumber('');
            setCustomerName('');
            setCustomerPhone('');
            setDiscount(0);
        }
    };

    const handleSendToKitchen = () => {
        if (currentOrder.length === 0) return;
        const newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'> = {
            type: 'Offline',
            items: currentOrder,
            total,
            discount,
            sourceInfo: orderSource === 'Dine-in' ? `Table: ${tableNumber}` : `Takeaway (${customerName || 'N/A'})`
        };
        onPrintKOT(newOrderData);
        setCurrentOrder([]);
        setTableNumber('');
        setCustomerName('');
        setCustomerPhone('');
        setDiscount(0);
    };

    const subtotal = currentOrder.reduce((acc, item) => acc + (Number(item.offlinePrice) || 0) * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const total = Math.max(0, subtotal + tax - discount);

    return (
        <div className="flex flex-col h-full bg-black overflow-hidden relative">
            {/* COMPACT MENU GRID */}
            <div className="h-[48%] flex flex-col p-1 border-b border-gray-800 overflow-hidden shrink-0">
                <div className="flex gap-1 mb-1 overflow-x-auto no-scrollbar items-center h-6 px-1">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-2 h-4 text-[6px] font-black rounded-full whitespace-nowrap transition-all uppercase ${activeCategory === category ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon border border-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-9 gap-1 overflow-y-auto no-scrollbar flex-1 pb-1">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} className="relative group">
                            <div 
                                onClick={() => addToOrder(item)} 
                                className={`h-full p-0.5 rounded text-center cursor-pointer border transition-all flex flex-col justify-center min-h-[35px] shadow-sm ${item.inStock ? 'bg-gray-900 border-gray-800 active:bg-gray-700' : 'bg-gray-950 border-gray-900 opacity-40 grayscale'}`}
                            >
                                <p className="text-[6px] text-white font-black leading-none line-clamp-2 mb-0.5 uppercase tracking-tighter">{item.name}</p>
                                <p className="text-lemon text-[7px] font-black">₹{item.offlinePrice}</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleStock?.(item.id); }}
                                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-black border border-white/10 rounded-full flex items-center justify-center"
                            >
                                <div className={`w-1 h-1 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CART SECTION */}
            <div className="flex-1 flex flex-col p-2 bg-gray-950 overflow-hidden pb-[80px]">
                <div className="flex items-center justify-between mb-1 shrink-0 px-1">
                    <div className="flex gap-1">
                        <button onClick={() => setOrderSource('Takeaway')} className={`px-2 py-0.5 text-[7px] font-black rounded uppercase ${orderSource === 'Takeaway' ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon'}`}>Takeaway</button>
                        <button onClick={() => setOrderSource('Dine-in')} className={`px-2 py-0.5 text-[7px] font-black rounded uppercase ${orderSource === 'Dine-in' ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon'}`}>Dine-in</button>
                    </div>
                    <button onClick={resetOrder} className="text-[7px] text-red-500 font-black uppercase">Clear</button>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-1 shrink-0">
                    <input type="text" value={orderSource === 'Dine-in' ? tableNumber : customerName} onChange={e => orderSource === 'Dine-in' ? setTableNumber(e.target.value) : setCustomerName(e.target.value)} placeholder={orderSource === 'Dine-in' ? "Table" : "Name"} className="w-full bg-gray-900 text-lemon text-[8px] p-1 rounded border border-gray-800 outline-none font-bold" />
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone" className="w-full bg-gray-900 text-lemon text-[8px] p-1 rounded border border-gray-800 outline-none font-bold" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-0.5 bg-black/40 rounded-md p-1 no-scrollbar border border-gray-900">
                    {currentOrder.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-lemon opacity-10 text-[7px] font-black uppercase">Empty</div>
                    ) : (
                        currentOrder.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-white/5 p-0.5 rounded border border-white/5">
                                <div className="w-[45%] flex items-center gap-1">
                                    <button onClick={() => removeFromOrder(item.id)} className="text-red-500 scale-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                    <div className="min-w-0">
                                        <p className="text-[7px] text-lemon font-bold truncate uppercase">{item.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-4 h-4 flex items-center justify-center rounded bg-gray-800 text-white text-[7px]">-</button>
                                    <span className="text-[8px] text-lemon font-black min-w-[8px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-4 h-4 flex items-center justify-center rounded bg-gray-800 text-white text-[7px]">+</button>
                                </div>
                                <p className="text-[8px] text-lemon font-black w-[15%] text-right">₹{(item.offlinePrice * item.quantity).toFixed(0)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gray-900 border-t border-gray-800 flex flex-col gap-1 z-40">
                <div className="text-right px-1">
                    <p className="text-[12px] text-lemon font-black tracking-tighter leading-none">TOTAL ₹{total.toFixed(0)}</p>
                </div>
                <button 
                    onClick={handleSendToKitchen} 
                    className="w-full bg-lemon text-black font-black py-2 rounded-lg text-[9px] uppercase active:scale-95 disabled:opacity-20 shadow-lg"
                    disabled={currentOrder.length === 0}
                >
                    GENERATE KOT
                </button>
            </div>
        </div>
    );
};

export default Billing;
