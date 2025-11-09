import React, { useState } from 'react';
import { MOCK_MENU_ITEMS } from '../constants';
import { MenuItem, OrderItem, OrderStatusItem } from '../types';

const categories = ['All', 'Appetizers', 'Soups', 'Salads', 'Main Courses', 'Side Dishes', 'Desserts', ...new Set(MOCK_MENU_ITEMS.map(item => item.category))].filter((v, i, a) => a.indexOf(v) === i);


const Billing: React.FC<{ onPrintKOT: (order: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp'>) => void }> = ({ onPrintKOT }) => {
    const [activeCategory, setActiveCategory] = useState('Appetizers');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [orderSource, setOrderSource] = useState<'Takeaway' | 'Dine-in'>('Takeaway');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const filteredMenuItems = MOCK_MENU_ITEMS.filter(item => 
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
        if (window.confirm('Are you sure you want to reset the current order?')) {
            setCurrentOrder([]);
            setOrderSource('Takeaway');
            setTableNumber('');
            setCustomerName('');
            setCustomerPhone('');
        }
    };
    
    const createKOTPrintContent = () => {
        return `
            <style>
                body { font-family: 'Courier New', monospace; font-size: 10pt; width: 80mm; margin: 0; padding: 5px; }
                h3, p { text-align: center; margin: 2px 0; }
                hr { border: none; border-top: 1px dashed black; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { padding: 2px; }
                .items th, .items td { border-bottom: 1px dashed #ccc; }
                .items th:first-child, .items td:first-child { text-align: left; }
                .items th:last-child, .items td:last-child { text-align: center; }
            </style>
            <h3>Kitchen Order Ticket</h3>
            <p>Date: ${new Date().toLocaleString()}</p>
            ${orderSource === 'Dine-in' && tableNumber ? `<p>Table #: ${tableNumber}</p>` : `<p>Order: ${orderSource}</p>`}
            ${customerName ? `<p>Customer: ${customerName}</p>` : ''}
            <hr>
            <table class="items">
                <thead><tr><th>Item</th><th>Qty</th></tr></thead>
                <tbody>
                    ${currentOrder.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    };

    const triggerPrint = (content: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print</title></head><body>' + content + '</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        } else {
            alert('Could not open print window. Please disable popup blockers.');
        }
    };

    const handleSendToKitchen = () => {
        if (currentOrder.length === 0) {
            alert('Cannot send an empty order to the kitchen.');
            return;
        }
        if (orderSource === 'Dine-in' && !tableNumber.trim()) {
            alert('Please enter a table number for Dine-in orders.');
            return;
        }

        const newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp'> = {
            type: 'Offline',
            items: currentOrder,
            total,
            sourceInfo: orderSource === 'Dine-in' ? `Table: ${tableNumber}` : `Takeaway (${customerName || 'N/A'})`
        };
        onPrintKOT(newOrderData);
        
        const kotContent = createKOTPrintContent();
        triggerPrint(kotContent);
        
        setCurrentOrder([]);
        setOrderSource('Takeaway');
        setTableNumber('');
        setCustomerName('');
        setCustomerPhone('');
        alert('Order sent to kitchen and is now visible on the dashboard.');
    };


    const subtotal = currentOrder.reduce((acc, item) => acc + item.offlinePrice * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Menu Selection */}
            <div className="lg:w-3/5 bg-black p-6 rounded-lg border border-gray-800 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4">Menu</h3>
                <div className="relative mb-4">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 text-white placeholder-gray-400 py-2 pl-10 pr-4 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
                    />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeCategory === category ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow overflow-y-auto pr-2">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-3 rounded-lg text-left cursor-pointer hover:border-lemon transition border border-gray-800 flex flex-col justify-between h-28">
                            <p className="text-white font-semibold leading-tight">{item.name}</p>
                            <p className="text-gray-400 text-sm mt-2">₹{item.offlinePrice.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Order */}
            <div className="bg-black p-6 rounded-lg border border-gray-800 lg:w-2/5 flex flex-col">
                 <h3 className="text-lg font-semibold text-white mb-4">Current Order</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Order Source</label>
                        <select 
                            value={orderSource}
                            onChange={(e) => setOrderSource(e.target.value as 'Takeaway' | 'Dine-in')}
                            className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
                        >
                            <option value="Takeaway">Takeaway</option>
                            <option value="Dine-in">Dine-in</option>
                        </select>
                    </div>
                    {orderSource === 'Dine-in' && (
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Table Number</label>
                            <input 
                                type="text" 
                                placeholder="Enter Table Number"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
                                required
                            />
                        </div>
                    )}
                     <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Customer Name</label>
                        <input type="text" placeholder="Optional" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800" />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Customer Phone</label>
                        <input type="text" placeholder="Optional" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-800" />
                    </div>
                 </div>

                 <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                    {currentOrder.length === 0 && <p className="text-gray-500 text-center py-10">No items in order.</p>}
                    {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <p className="text-white flex-grow">{item.name}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 rounded bg-gray-800 text-white">-</button>
                                <span className="text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 rounded bg-gray-800 text-white">+</button>
                            </div>
                            <p className="text-white w-20 text-right">₹{(item.offlinePrice * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromOrder(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    ))}
                 </div>
                 <div className="border-t border-gray-800 mt-auto pt-4 space-y-2">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-white font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button onClick={resetOrder} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700">Reset Order</button>
                    <button onClick={handleSendToKitchen} className="flex-1 bg-lemon text-black font-bold py-3 rounded-lg hover:bg-lemon-dark">Print KOT & Send</button>
                 </div>
            </div>
        </div>
    );
};

export default Billing;