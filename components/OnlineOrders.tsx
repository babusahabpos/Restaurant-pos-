import React, { useState } from 'react';
import { MOCK_MENU_ITEMS } from '../constants';
import { MenuItem, OrderItem, OrderStatusItem } from '../types';

const categories = ['All', ...new Set(MOCK_MENU_ITEMS.map(item => item.category))];

const OnlineOrders: React.FC<{ onPrintKOT: (order: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp'>) => void }> = ({ onPrintKOT }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [platform, setPlatform] = useState<'Swiggy' | 'Zomato'>('Swiggy');
    const [orderId, setOrderId] = useState('');

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
            setOrderId('');
            setPlatform('Swiggy');
        }
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
            alert('Cannot process an empty order.');
            return;
        }
        if (!orderId.trim()) {
            alert('Platform Order ID is mandatory.');
            return;
        }
        
        let kotContent = `
            <style>
                body { font-family: 'Courier New', monospace; font-size: 10pt; width: 80mm; margin: 0; padding: 5px; }
                h3, p { text-align: center; margin: 2px 0; }
                hr { border: none; border-top: 1px dashed black; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { padding: 2px; text-align: left;}
            </style>
            <h3>ONLINE ORDER KOT</h3>
            <p>Platform: ${platform}</p>
            <p>Order ID: ${orderId}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <hr>
            <table>
                <thead><tr><th>Item</th><th>Qty</th></tr></thead>
                <tbody>
                    ${currentOrder.map(item => `<tr><td>${item.name}</td><td style="text-align:center;">${item.quantity}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
        triggerPrint(kotContent);

        const newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp'> = {
            type: 'Online',
            items: currentOrder,
            total,
            sourceInfo: `${platform} #${orderId}`
        };
        onPrintKOT(newOrderData);

        alert('Online order sent to kitchen and is now visible on the dashboard.');
        setCurrentOrder([]);
        setOrderId('');
        setPlatform('Swiggy');
    };

    const subtotal = currentOrder.reduce((acc, item) => acc + item.onlinePrice * item.quantity, 0);
    const total = subtotal;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Menu Selection */}
            <div className="lg:w-3/5 bg-black p-6 rounded-lg border border-gray-800 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">Menu</h3>
                 <div className="flex flex-col sm:flex-row gap-4 mb-4">
                     <input 
                        type="text" 
                        placeholder="Search all menu items..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow bg-gray-900 text-white placeholder-gray-400 p-2.5 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
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
                           <p className="text-gray-400 text-sm mt-2">₹{item.onlinePrice.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Log Online Order */}
            <div className="bg-black p-6 rounded-lg border border-gray-800 lg:w-2/5 flex flex-col">
                 <h3 className="text-lg font-semibold text-white mb-4">Log Online Order</h3>
                 <p className="text-sm text-gray-500 mb-4">Manually enter details for an order received from an online platform.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Platform</label>
                        <select 
                            value={platform}
                            onChange={e => setPlatform(e.target.value as 'Swiggy' | 'Zomato')}
                            className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
                        >
                            <option>Swiggy</option>
                            <option>Zomato</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Platform Order ID</label>
                        <input 
                            type="text" 
                            placeholder="Platform Order ID (Mandatory)" 
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            className="w-full bg-gray-900 text-white p-2 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon" 
                            required 
                        />
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
                            <p className="text-white w-20 text-right">₹{(item.onlinePrice * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromOrder(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    ))}
                 </div>
                 <div className="border-t border-gray-800 mt-auto pt-4 space-y-2">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-white font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button onClick={resetOrder} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700">Reset Order</button>
                    <button 
                        onClick={handleSendToKitchen} 
                        className="flex-1 bg-lemon text-black font-bold py-3 rounded-lg hover:bg-lemon-dark disabled:bg-lemon/50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={currentOrder.length === 0 || !orderId.trim()}
                    >
                        Print KOT & Send
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default OnlineOrders;