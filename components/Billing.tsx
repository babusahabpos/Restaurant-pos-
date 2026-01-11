
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
        if (!item.inStock) {
            alert('Item is currently Out of Stock.');
            return;
        }
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
        alert('KOT Sent to Kitchen!');
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
            {/* MENU SECTION (TOP) */}
            <div className="h-[45%] flex flex-col p-2 border-b border-gray-800 overflow-hidden shrink-0">
                <div className="flex justify-between items-center mb-2 px-1">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 items-center h-10">
                        {categories.map(category => (
                            <button 
                                key={category} 
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 h-8 text-[10px] font-black rounded-full whitespace-nowrap transition-all uppercase flex items-center justify-center shrink-0 ${activeCategory === category ? 'bg-lemon text-black ring-2 ring-white/10' : 'bg-gray-800 text-lemon border border-gray-700'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1 pb-2">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} className="relative">
                            <div 
                                onClick={() => addToOrder(item)} 
                                className={`h-full p-2 rounded-xl text-center cursor-pointer border transition-all flex flex-col justify-center min-h-[75px] shadow-lg ${item.inStock ? 'bg-gray-900 border-gray-800 active:bg-gray-700 active:scale-95' : 'bg-gray-950 border-gray-900 opacity-60 grayscale'}`}
                            >
                                <p className="text-[9px] text-white font-bold leading-tight line-clamp-2 mb-1 uppercase tracking-tighter">{item.name}</p>
                                <p className="text-lemon text-[10px] font-black">₹{item.offlinePrice}</p>
                                {!item.inStock && <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-red-500 uppercase bg-black/40 rounded-xl">Sold Out</span>}
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onToggleStock?.(item.id); }}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center border border-white/10"
                                title="Toggle In-Stock"
                            >
                                <div className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CART & INFO SECTION (MIDDLE) */}
            <div className="flex-1 flex flex-col p-2 bg-gray-950 overflow-hidden pb-[120px]">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <div className="flex gap-1">
                        <button onClick={() => setOrderSource('Takeaway')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase ${orderSource === 'Takeaway' ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon'}`}>Takeaway</button>
                        <button onClick={() => setOrderSource('Dine-in')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase ${orderSource === 'Dine-in' ? 'bg-lemon text-black' : 'bg-gray-800 text-lemon'}`}>Dine-in</button>
                    </div>
                    <button onClick={resetOrder} className="text-[10px] text-red-500 font-black uppercase px-2 hover:underline">Clear Order</button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
                    <input 
                        type="text" 
                        value={orderSource === 'Dine-in' ? tableNumber : customerName} 
                        onChange={e => orderSource === 'Dine-in' ? setTableNumber(e.target.value) : setCustomerName(e.target.value)} 
                        placeholder={orderSource === 'Dine-in' ? "Table #" : "Cust. Name"} 
                        className="w-full bg-gray-900 text-lemon text-[11px] p-2 rounded-lg border border-gray-800 focus:border-lemon outline-none font-bold" 
                    />
                    <input 
                        type="tel" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)} 
                        placeholder="Mobile #" 
                        className="w-full bg-gray-900 text-lemon text-[11px] p-2 rounded-lg border border-gray-800 focus:border-lemon outline-none font-bold" 
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 bg-black/40 rounded-xl p-1 no-scrollbar border border-gray-900">
                    {currentOrder.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-lemon opacity-20 italic text-xs uppercase font-black">
                            Empty Cart
                        </div>
                    ) : (
                        currentOrder.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5 group">
                                <div className="w-[40%] flex items-center gap-2">
                                    <button onClick={() => removeFromOrder(item.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                    <div>
                                        <p className="text-[10px] text-lemon font-bold truncate uppercase">{item.name}</p>
                                        <p className="text-[9px] text-gray-500 font-mono">₹{item.offlinePrice}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black">-</button>
                                    <span className="text-[11px] text-lemon font-black min-w-[15px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black">+</button>
                                </div>
                                <p className="text-[11px] text-lemon font-black w-[20%] text-right tracking-tighter">₹{(item.offlinePrice * item.quantity).toFixed(0)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ACTION BAR (FIXED BOTTOM OF PAGE) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-900 border-t border-gray-800 flex flex-col gap-2 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 font-black uppercase">Discount:</span>
                        <input 
                            type="number" 
                            value={discount || ''} 
                            onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="0" 
                            className="w-14 bg-black text-lemon text-[11px] font-black p-1 rounded border border-gray-700 text-center focus:border-lemon outline-none"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase leading-none mb-1">TOTAL PAYABLE</p>
                        <p className="text-2xl text-lemon font-black tracking-tighter leading-none">₹{total.toFixed(0)}</p>
                    </div>
                </div>
                <button 
                    onClick={handleSendToKitchen} 
                    className="w-full bg-lemon text-black font-black py-4 rounded-2xl text-[12px] uppercase tracking-[0.1em] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale shadow-[0_4px_15px_rgba(255,255,0,0.3)]"
                    disabled={currentOrder.length === 0}
                >
                    GENERATE KOT
                </button>
            </div>
        </div>
    );
};

export default Billing;
