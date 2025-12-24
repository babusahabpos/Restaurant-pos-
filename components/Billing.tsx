
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, OrderStatusItem } from '../types';

interface BillingProps {
    onPrintKOT: (order: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'>) => void;
    menuItems: MenuItem[];
    taxRate: number;
    restaurantName: string;
    isPrinterEnabled: boolean;
}

const Billing: React.FC<BillingProps> = ({ onPrintKOT, menuItems = [], taxRate, restaurantName, isPrinterEnabled }) => {
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
        <div className="flex flex-col h-full bg-black">
            {/* TOP HALF: MENU */}
            <div className="h-[45%] flex flex-col p-2 border-b border-gray-800 overflow-hidden">
                <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar scroll-smooth shrink-0 items-center h-10">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 h-8 text-[10px] font-black rounded-full whitespace-nowrap transition-all uppercase flex items-center justify-center shrink-0 ${activeCategory === category ? 'bg-lemon text-black ring-2 ring-white/10' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-2 rounded-xl text-center cursor-pointer border border-gray-800 active:bg-gray-700 active:scale-95 transition-all flex flex-col justify-center min-h-[60px] select-none shadow-lg shadow-black">
                           <p className="text-[9px] text-white font-bold leading-tight line-clamp-2 mb-1 uppercase tracking-tighter">{item.name}</p>
                           <p className="text-lemon text-[10px] font-black">₹{item.offlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM HALF: BILL */}
            <div className="h-[55%] flex flex-col p-2 bg-gray-950 overflow-hidden relative shadow-[0_-8px_16px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <div className="flex gap-1">
                        <button onClick={() => setOrderSource('Takeaway')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase ${orderSource === 'Takeaway' ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-400'}`}>Takeaway</button>
                        <button onClick={() => setOrderSource('Dine-in')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase ${orderSource === 'Dine-in' ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-400'}`}>Dine-in</button>
                    </div>
                    <button onClick={resetOrder} className="text-[10px] text-red-500 font-black uppercase px-2">Reset</button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
                    <input 
                        type="text" 
                        value={orderSource === 'Dine-in' ? tableNumber : customerName} 
                        onChange={e => orderSource === 'Dine-in' ? setTableNumber(e.target.value) : setCustomerName(e.target.value)} 
                        placeholder={orderSource === 'Dine-in' ? "Table Number" : "Customer Name"} 
                        className="w-full bg-gray-900 text-white text-[11px] p-2 rounded-lg border border-gray-800 focus:border-lemon outline-none font-bold" 
                    />
                    <input 
                        type="tel" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)} 
                        placeholder="Mobile Number" 
                        className="w-full bg-gray-900 text-white text-[11px] p-2 rounded-lg border border-gray-800 focus:border-lemon outline-none font-bold" 
                    />
                </div>

                <div className="flex-1 overflow-y-auto mb-2 space-y-1 bg-black/40 rounded-xl p-1 no-scrollbar">
                    {currentOrder.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.12"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">Select Items from Menu</span>
                        </div>
                    ) : (
                        currentOrder.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                                <div className="w-[40%]">
                                    <p className="text-[10px] text-white font-bold truncate uppercase">{item.name}</p>
                                    <p className="text-[9px] text-gray-500 font-mono">₹{item.offlinePrice}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black transition-colors">-</button>
                                    <span className="text-[11px] text-white font-black min-w-[15px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black transition-colors">+</button>
                                </div>
                                <p className="text-[11px] text-lemon font-black w-[20%] text-right tracking-tighter">₹{(item.offlinePrice * item.quantity).toFixed(0)}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="shrink-0 flex flex-col gap-2 border-t border-gray-800 pt-2 bg-gray-950">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-500 font-black uppercase">Discount</span>
                            <input 
                                type="number" 
                                value={discount || ''} 
                                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="0" 
                                className="w-14 bg-gray-900 text-white text-[11px] font-black p-1.5 rounded-lg border border-gray-800 text-right focus:border-lemon outline-none"
                            />
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-[20px] text-lemon font-black tracking-tighter leading-none">TOTAL: ₹{total.toFixed(0)}</div>
                            <div className="text-[9px] text-gray-500 font-black uppercase mt-1">Tax Included (${taxRate}%)</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleSendToKitchen} 
                        className="w-full bg-lemon text-black font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all disabled:opacity-20 disabled:grayscale shadow-xl shadow-lemon/10"
                        disabled={currentOrder.length === 0}
                    >
                        Send to Kitchen & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
