
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

    const triggerPrint = (content: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><body>' + content + '</body></html>');
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
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
    const total = subtotal + tax - discount;

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
                           <p className="text-lemon text-[10px] font-bold">₹{item.offlinePrice}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM HALF: BILL */}
            <div className="h-1/2 flex flex-col p-4 bg-gray-950 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                        <button onClick={() => setOrderSource('Takeaway')} className={`px-4 py-1 text-[10px] font-bold rounded ${orderSource === 'Takeaway' ? 'bg-lemon text-black' : 'bg-gray-800 text-white'}`}>Takeaway</button>
                        <button onClick={() => setOrderSource('Dine-in')} className={`px-4 py-1 text-[10px] font-bold rounded ${orderSource === 'Dine-in' ? 'bg-lemon text-black' : 'bg-gray-800 text-white'}`}>Dine-in</button>
                    </div>
                    <button onClick={resetOrder} className="text-[10px] text-red-500 font-bold uppercase">Clear</button>
                </div>

                <div className="flex gap-2 mb-2">
                    {orderSource === 'Dine-in' ? (
                        <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Tbl #" className="w-full bg-gray-900 text-white text-xs p-2 rounded border border-gray-800" />
                    ) : (
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Name" className="w-full bg-gray-900 text-white text-xs p-2 rounded border border-gray-800" />
                    )}
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone" className="w-full bg-gray-900 text-white text-xs p-2 rounded border border-gray-800" />
                </div>

                <div className="flex-1 overflow-y-auto mb-2 space-y-1">
                    {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-black/40 p-2 rounded">
                            <p className="text-xs text-white truncate w-1/3">{item.name}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white">-</button>
                                <span className="text-xs text-white min-w-[20px] text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white">+</button>
                            </div>
                            <p className="text-xs text-lemon font-bold w-20 text-right">₹{(item.offlinePrice * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-2 items-center">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400"><span>Sub</span><span>₹{subtotal.toFixed(0)}</span></div>
                        <div className="flex justify-between text-[10px] text-gray-400"><span>Tax</span><span>₹{tax.toFixed(0)}</span></div>
                        <div className="flex justify-between text-xs text-white font-bold"><span>Total</span><span className="text-lemon">₹{total.toFixed(2)}</span></div>
                    </div>
                    <button 
                        onClick={handleSendToKitchen} 
                        className="h-full bg-lemon text-black font-black text-xs rounded-lg active:scale-95 transition"
                        disabled={currentOrder.length === 0}
                    >
                        SEND TO KITCHEN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
