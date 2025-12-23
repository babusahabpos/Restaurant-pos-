
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
        if (window.confirm('Reset order?')) {
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
        alert('Sent to kitchen!');
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
                           <p className="text-lemon text-[10px] font-black">₹{item.offlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM HALF: BILL */}
            <div className="h-[55%] flex flex-col p-3 bg-gray-950 overflow-hidden shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                        <button onClick={() => setOrderSource('Takeaway')} className={`px-4 py-1.5 text-[10px] font-black rounded uppercase ${orderSource === 'Takeaway' ? 'bg-lemon text-black' : 'bg-gray-800 text-white border border-gray-700'}`}>Takeaway</button>
                        <button onClick={() => setOrderSource('Dine-in')} className={`px-4 py-1.5 text-[10px] font-black rounded uppercase ${orderSource === 'Dine-in' ? 'bg-lemon text-black' : 'bg-gray-800 text-white border border-gray-700'}`}>Dine-in</button>
                    </div>
                    <button onClick={resetOrder} className="text-[10px] text-red-500 font-black uppercase px-2 py-1">Clear</button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                    {orderSource === 'Dine-in' ? (
                        <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Tbl #" className="w-full bg-gray-900 text-white text-xs p-2 rounded border border-gray-800 focus:border-lemon outline-none" />
                    ) : (
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Name" className="w-full bg-gray-900 text-white text-xs p-2 rounded border border-gray-800 focus:border-lemon outline-none" />
                    )}
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone" className="w-full bg-gray-900 text-white text-xs p-2 rounded border border-gray-800 focus:border-lemon outline-none" />
                </div>

                <div className="flex-1 overflow-y-auto mb-2 space-y-1 bg-black/20 rounded p-1">
                    {currentOrder.length === 0 && <p className="text-gray-700 text-center py-10 text-[10px] font-bold uppercase tracking-widest">Order is empty</p>}
                    {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                            <div className="w-[45%]">
                                <p className="text-[10px] text-white font-bold truncate uppercase">{item.name}</p>
                                <p className="text-[9px] text-gray-500">₹{item.offlinePrice} / unit</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black transition-colors">-</button>
                                <span className="text-[11px] text-white font-bold min-w-[20px] text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 text-white active:bg-lemon active:text-black transition-colors">+</button>
                            </div>
                            <p className="text-[11px] text-lemon font-black w-[25%] text-right">₹{(item.offlinePrice * item.quantity).toFixed(0)}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-800 pt-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Discount</span>
                            <input 
                                type="number" 
                                value={discount || ''} 
                                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="₹ 0" 
                                className="w-20 bg-gray-900 text-white text-[11px] font-bold p-1 rounded border border-gray-800 text-right focus:border-lemon outline-none"
                            />
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex gap-4 text-[9px] text-gray-500 font-bold uppercase">
                                <span>Sub: ₹{subtotal.toFixed(0)}</span>
                                <span>Tax: ₹{tax.toFixed(0)}</span>
                            </div>
                            <div className="text-xl text-lemon font-black tracking-tighter">TOTAL: ₹{total.toFixed(2)}</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleSendToKitchen} 
                        className="w-full bg-lemon text-black font-black py-3 rounded-xl text-xs active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale uppercase"
                        disabled={currentOrder.length === 0}
                    >
                        Confirm & Send to Kitchen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
