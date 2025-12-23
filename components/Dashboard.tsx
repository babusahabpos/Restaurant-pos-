
import React, { useState, useMemo, useEffect } from 'react';
import { DashboardData, OrderStatusItem, MenuItem, OrderItem } from '../types';

const triggerPrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Print Bill</title></head><body>' + content + '</body></html>');
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

const createBillContent = (order: OrderStatusItem, paymentMethod: string, taxRate: number, restaurantName: string, address: string, fssai: string) => {
    
    let subtotal = order.total;
    let taxAmount = 0;
    let deliveryCharge = 0;
    let discount = order.discount || 0;

    // Calculation Logic considering Discount
    if (order.type === 'Offline') {
        // Reverse calculation: Total = (Subtotal + Tax) - Discount
        const totalIncludingTax = order.total + discount;
        subtotal = totalIncludingTax / (1 + taxRate / 100);
        taxAmount = totalIncludingTax - subtotal;
    } else {
        // Online Orders
        if (order.deliveryDetails) {
            deliveryCharge = order.deliveryDetails.deliveryCharge;
            const totalBeforeDelivery = order.total - deliveryCharge + discount;
            subtotal = totalBeforeDelivery / (1 + taxRate / 100);
            taxAmount = totalBeforeDelivery - subtotal;
        } else {
             // Basic manual online order
             subtotal = order.total + discount; 
        }
    }

    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;

    return `
        <style>
            body { font-family: 'Courier New', monospace; font-size: 10pt; width: 80mm; margin: 0; padding: 5px; color: black; }
            .center { text-align: center; }
            .right { text-align: right; }
            h2, p { margin: 2px 0; }
            hr { border: none; border-top: 1px dashed black; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 2px; }
            .items th, .items td { border-bottom: 1px dashed #ccc; }
            .totals td:first-child { text-align: left; }
            .totals td:last-child { text-align: right; }
        </style>
        <div class="center">
            <h2>${restaurantName}</h2>
            <p>${address}</p>
            ${fssai ? `<p>FSSAI: ${fssai}</p>` : ''}
        </div>
        <hr>
        <p><strong>Order:</strong> ${order.sourceInfo}</p>
        <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
        <p><strong>Payment Mode:</strong> ${order.deliveryDetails?.paymentMethod || paymentMethod}</p>
        ${order.deliveryDetails?.address ? `<p><strong>Address:</strong> ${order.deliveryDetails.address}</p>` : ''}
        <hr>
        <table class="items">
            <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td class="center">${item.quantity}</td>
                        <td class="right">₹${(Number(item.offlinePrice || item.onlinePrice) || 0).toFixed(2)}</td>
                        <td class="right">₹${((Number(item.offlinePrice || item.onlinePrice) || 0) * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <hr>
        <table class="totals">
            <tbody>
                <tr><td>Subtotal</td><td>₹${subtotal.toFixed(2)}</td></tr>
                <tr><td>CGST (${(taxRate/2)}%)</td><td>₹${cgst.toFixed(2)}</td></tr>
                <tr><td>SGST (${(taxRate/2)}%)</td><td>₹${sgst.toFixed(2)}</td></tr>
                ${discount > 0 ? `<tr><td>Discount</td><td>-₹${discount.toFixed(2)}</td></tr>` : ''}
                ${deliveryCharge > 0 ? `<tr><td>Delivery Charge</td><td>₹${deliveryCharge.toFixed(2)}</td></tr>` : ''}
            </tbody>
        </table>
        <hr>
        <table class="totals">
            <tbody>
                <tr><td><strong>Grand Total</strong></td><td><strong>₹${Math.round(order.total).toFixed(2)}</strong></td></tr>
            </tbody>
        </table>
        <hr>
        <p class="center">Thank you for dining with us!</p>
    `;
};


const TodaysOrdersModal: React.FC<{ orders: OrderStatusItem[]; onClose: () => void }> = ({ orders, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Today's Orders</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto">
                    {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0 hidden md:table-header-group">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Order Info</th>
                                        <th scope="col" className="px-6 py-3">Time</th>
                                        <th scope="col" className="px-6 py-3">Items</th>
                                        <th scope="col" className="px-6 py-3">Total</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                                        <tr key={order.id} className="bg-black border-gray-800 block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none overflow-hidden shadow-lg md:shadow-none">
                                            <td className="px-4 py-2 md:px-6 md:py-4 font-medium text-white block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Order Info</span>{order.sourceInfo}</td>
                                            <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Time</span>{new Date(order.timestamp).toLocaleTimeString()}</td>
                                            <td className="px-4 py-2 md:px-6 md:py-4 text-xs block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Items</span>{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                                            <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Total</span>₹{order.total.toFixed(2)}</td>
                                            <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left">
                                                <span className="float-left font-bold md:hidden">Status</span>
                                                <span className={`${order.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-10 text-gray-500">No orders for today yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const EditOrderModal: React.FC<{
    order: OrderStatusItem;
    menuItems: MenuItem[];
    onClose: () => void;
    onSave: (updatedOrder: OrderStatusItem) => void;
    taxRate: number;
}> = ({ order, menuItems, onClose, onSave, taxRate }) => {
    const [editedItems, setEditedItems] = useState<OrderItem[]>(order.items);
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState<number>(order.discount || 0);

    const priceType = order.type === 'Online' ? 'onlinePrice' : 'offlinePrice';

    const addToOrder = (item: MenuItem) => {
        const existingItem = editedItems.find(orderItem => orderItem.id === item.id);
        if (existingItem) {
            setEditedItems(editedItems.map(orderItem => orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem));
        } else {
            setEditedItems([...editedItems, { ...item, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromOrder(id);
        } else {
            setEditedItems(editedItems.map(item => item.id === id ? { ...item, quantity } : item));
        }
    };

    const removeFromOrder = (id: number) => {
        setEditedItems(editedItems.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        const subtotal = editedItems.reduce((acc, item) => acc + (Number(item[priceType]) || 0) * item.quantity, 0);
        const deliveryCharge = order.deliveryDetails?.deliveryCharge || 0;
        const tax = subtotal * (taxRate / 100);
        return Math.max(0, subtotal + tax + deliveryCharge - discount);
    };

    const handleSave = () => {
        const updatedOrder: OrderStatusItem = {
            ...order,
            items: editedItems,
            discount: discount,
            total: calculateTotal()
        };
        onSave(updatedOrder);
        onClose();
    };

    const filteredMenu = menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.inStock);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Edit Order: {order.sourceInfo}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1">
                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        <h4 className="text-lemon font-bold mb-2 uppercase text-xs">Current Items</h4>
                        {editedItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-800 p-2 rounded mb-2 border border-white/5">
                                <div className="flex-1 mr-2">
                                    <p className="text-white text-xs font-bold uppercase">{item.name}</p>
                                    <p className="text-gray-400 text-[10px]">₹{item[priceType]}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-gray-700 w-6 h-6 rounded text-white">-</button>
                                    <span className="text-white text-xs font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-gray-700 w-6 h-6 rounded text-white">+</button>
                                    <button onClick={() => removeFromOrder(item.id)} className="ml-2 text-red-500 hover:text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                         <div className="mt-4 pt-4 border-t border-gray-700">
                             <div className="flex justify-between items-center mb-2">
                                 <label className="text-gray-400 text-xs uppercase font-bold">Discount (₹)</label>
                                 <input 
                                    type="number" 
                                    value={discount || ''} 
                                    onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="bg-gray-800 text-white p-1 rounded w-24 text-right text-xs font-bold outline-none border border-gray-700"
                                    placeholder="0"
                                />
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-white font-bold uppercase text-xs">New Total:</span>
                                 <span className="text-lemon font-black text-lg">₹{calculateTotal().toFixed(2)}</span>
                             </div>
                         </div>
                    </div>

                    {/* Add Items */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                         <h4 className="text-lemon font-bold mb-2 uppercase text-xs">Add Items</h4>
                         <input 
                            type="text" 
                            placeholder="Search menu..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-gray-800 text-white p-2 rounded mb-2 text-xs border border-gray-700 outline-none"
                        />
                        <div className="overflow-y-auto flex-1 bg-black/20 rounded">
                            {filteredMenu.map(item => (
                                <div key={item.id} onClick={() => addToOrder(item)} className="cursor-pointer hover:bg-gray-800 p-2 rounded border-b border-white/5 flex justify-between items-center">
                                    <span className="text-white text-xs uppercase font-medium">{item.name}</span>
                                    <span className="text-lemon text-[10px] font-bold">₹{item[priceType]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-700 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase">Cancel</button>
                    <button onClick={handleSave} className="bg-lemon text-black px-6 py-2 rounded-lg font-black text-xs uppercase">Update Order</button>
                </div>
            </div>
        </div>
    );
};

const SettleBillModal: React.FC<{
    order: OrderStatusItem;
    onClose: () => void;
    onSettle: (orderId: number, paymentMethod: string) => void;
}> = ({ order, onClose, onSettle }) => {
    const paymentMethods = ['Cash', 'PhonePe', 'Google Pay'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Settle Bill</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                        <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
                            <span>Order:</span>
                            <span className="text-white">{order.sourceInfo}</span>
                        </div>
                         <div className="flex justify-between text-gray-400 mt-3 items-center">
                            <span className="text-xs font-bold uppercase">Payable Amount:</span>
                            <span className="font-black text-3xl text-lemon tracking-tighter">₹{order.total.toFixed(2)}</span>
                        </div>
                        {order.discount && order.discount > 0 && (
                             <div className="flex justify-between text-green-400 mt-2 text-[10px] font-bold uppercase">
                                <span>Discount:</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">Select Payment Method</p>
                    <div className="grid grid-cols-1 gap-3">
                        {paymentMethods.map(method => (
                             <button
                                key={method}
                                onClick={() => onSettle(order.id, method)}
                                className="w-full bg-lemon hover:bg-lemon-dark text-black font-black py-4 px-4 rounded-xl transition-all active:scale-95 uppercase text-sm"
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const PendingOrdersModal: React.FC<{ 
    onlineOrders: OrderStatusItem[]; 
    offlineOrders: OrderStatusItem[]; 
    onClose: () => void;
    onCompleteOrder: (orderId: number) => void;
    onInitiateSettle: (order: OrderStatusItem) => void;
    onEditOrder: (order: OrderStatusItem) => void;
}> = ({ onlineOrders, offlineOrders, onClose, onCompleteOrder, onInitiateSettle, onEditOrder }) => {
    const [activeTab, setActiveTab] = useState<'Online' | 'Offline'>('Online');

    const ordersToShow = activeTab === 'Online' ? onlineOrders : offlineOrders;
    
    const renderOrderList = (orders: OrderStatusItem[]) => {
        if (orders.length === 0) {
            return <p className="text-center py-20 text-gray-700 font-bold uppercase text-[10px] tracking-widest">No pending {activeTab.toLowerCase()} orders.</p>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0 hidden md:table-header-group">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order Info</th>
                            <th scope="col" className="px-6 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Items</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                            <tr key={order.id} className="bg-black border-gray-800 block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none overflow-hidden shadow-lg md:shadow-none border md:border-none">
                                <td className="px-4 py-2 md:px-6 md:py-4 font-bold text-white block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0 uppercase text-xs"><span className="float-left font-bold md:hidden text-gray-500">Order:</span>{order.sourceInfo}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0 text-[10px]"><span className="float-left font-bold md:hidden text-gray-500">Time:</span>{new Date(order.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 text-[10px] block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0 italic"><span className="float-left font-bold md:hidden text-gray-500 font-normal not-italic">Items:</span>{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0 font-black text-lemon text-lg"><span className="float-left font-bold md:hidden text-gray-500 text-xs">Total:</span>₹{order.total.toFixed(0)}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap block md:table-cell text-right md:text-left space-x-2">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => onEditOrder(order)}
                                            className="bg-blue-600/20 text-blue-400 border border-blue-600/50 font-black py-1.5 px-4 rounded text-[10px] uppercase"
                                        >
                                            Edit
                                        </button>

                                        {activeTab === 'Offline' && (
                                            <button
                                                onClick={() => onInitiateSettle(order)}
                                                className="bg-lemon text-black font-black py-1.5 px-4 rounded text-[10px] uppercase"
                                            >
                                                Bill
                                            </button>
                                        )}
                                        {activeTab === 'Online' && (
                                            <button
                                                onClick={() => onCompleteOrder(order.id)}
                                                className="bg-green-600 text-white font-black py-1.5 px-4 rounded text-[10px] uppercase"
                                            >
                                                Done
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Pending Orders</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                
                <div className="flex border-b border-gray-800 mb-4">
                    <button 
                        onClick={() => setActiveTab('Online')}
                        className={`py-2 px-6 transition-colors duration-300 uppercase text-xs font-black tracking-widest ${activeTab === 'Online' ? 'text-lemon border-b-2 border-lemon font-semibold' : 'text-gray-500 hover:text-white'}`}
                    >
                        Online ({onlineOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('Offline')}
                        className={`py-2 px-6 transition-colors duration-300 uppercase text-xs font-black tracking-widest ${activeTab === 'Offline' ? 'text-lemon border-b-2 border-lemon font-semibold' : 'text-gray-500 hover:text-white'}`}
                    >
                        Offline ({offlineOrders.length})
                    </button>
                </div>

                <div className="overflow-y-auto">
                    {renderOrderList(ordersToShow)}
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-black p-6 rounded-lg shadow-sm border border-gray-800 flex justify-between items-center h-full">
        <div className="flex flex-col h-full justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-tighter">{title}</p>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-gray-500 text-[10px] font-bold uppercase mt-1">{subtext}</p>
        </div>
        <div className="text-gray-700">{icon}</div>
    </div>
);

const PlatformCard: React.FC<{ name: string; logoUrl: string; linkUrl: string }> = ({ name, logoUrl, linkUrl }) => (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center space-y-2 h-40 border border-gray-200 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer grayscale hover:grayscale-0">
            <img src={logoUrl} alt={`${name} logo`} className="h-16 w-16 object-contain" />
            <span className="text-black font-black uppercase text-xs tracking-widest">{name}</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase underline">Partner Desk</span>
        </div>
    </a>
);

// New Component for QR Orders
const QrOrdersSection: React.FC<{ 
    orders: OrderStatusItem[]; 
    onAccept: (orderId: number) => void;
    onPrint: (order: OrderStatusItem) => void;
    onNavigateToQrMenu: () => void;
}> = ({ orders, onAccept, onPrint, onNavigateToQrMenu }) => {
    
    useEffect(() => {
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        let interval: any;
        
        if (orders.length > 0) {
            if (audio) {
                audio.play().catch(e => console.log("Audio play blocked", e));
                interval = setInterval(() => {
                    audio.play().catch(e => console.log("Audio play blocked", e));
                }, 5000);
            }
        }
        return () => clearInterval(interval);
    }, [orders.length]);

    if (orders.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">QR Order Listener</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Listening for new customer orders...</p>
                    </div>
                </div>
                <button 
                    onClick={onNavigateToQrMenu}
                    className="flex items-center gap-2 text-lemon hover:text-white text-[10px] font-black uppercase border border-lemon/30 px-6 py-3 rounded-xl hover:bg-lemon/10 transition shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Show QR Code
                </button>
            </div>
        );
    }

    return (
        <div className="bg-red-900/20 border-2 border-red-500 p-6 rounded-lg shadow-lg mb-6 animate-pulse">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-lemon flex items-center gap-2 uppercase tracking-tighter">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    QR Order ({orders.length})
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-black border border-gray-700 p-4 rounded-xl shadow-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-black text-white text-lg uppercase tracking-tight">{order.sourceInfo}</span>
                            <span className="text-[9px] font-black uppercase bg-gray-800 text-gray-400 px-2 py-1 rounded">{new Date(order.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <ul className="text-[10px] font-bold text-gray-400 mb-3 space-y-1 uppercase italic">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="border-b border-white/5 pb-1">{item.name} x {item.quantity}</li>
                            ))}
                        </ul>
                         <p className="font-black text-lemon mb-3 text-right text-xl tracking-tighter">TOTAL: ₹{order.total.toFixed(0)}</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onAccept(order.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg text-[10px] uppercase shadow-lg"
                            >
                                Accept
                            </button>
                             <button 
                                onClick={() => { onPrint(order); onAccept(order.id); }}
                                className="flex-1 bg-lemon hover:bg-lemon-dark text-black font-black py-3 rounded-lg text-[10px] uppercase shadow-lg"
                            >
                                Accept & Print
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface DashboardProps {
    data: DashboardData;
    orders: OrderStatusItem[];
    onCompleteOrder: (orderId: number) => void;
    taxRate: number;
    restaurantName: string;
    address: string;
    fssai: string;
    menuItems: MenuItem[];
    onUpdateOrder: (updatedOrder: OrderStatusItem) => void;
    isPrinterEnabled: boolean;
    onNavigateToQrMenu: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, orders, onCompleteOrder, taxRate, restaurantName, address, fssai, menuItems, onUpdateOrder, isPrinterEnabled, onNavigateToQrMenu }) => {
    const [showTodaysOrders, setShowTodaysOrders] = useState(false);
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);
    const [settlingOrder, setSettlingOrder] = useState<OrderStatusItem | null>(null);
    const [editingOrder, setEditingOrder] = useState<OrderStatusItem | null>(null);

    const incomingQrOrders = orders.filter(o => o.status === 'Placed');
    const pendingOrders = orders.filter(o => o.status === 'Preparation');
    
    const pendingOnlineOrders = pendingOrders.filter(o => o.type === 'Online');
    const pendingOfflineOrders = pendingOrders.filter(o => o.type === 'Offline');
    
    const todaysOrders = orders.filter(o => {
      const orderDate = new Date(o.timestamp);
      const today = new Date();
      return orderDate.getDate() === today.getDate() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getFullYear() === today.getFullYear();
    });

    const handleSettleAndPrint = (orderId: number, paymentMethod: string) => {
        const orderToSettle = orders.find(o => o.id === orderId);
        if (orderToSettle) {
            onCompleteOrder(orderId);
            if (isPrinterEnabled) {
                const billContent = createBillContent(orderToSettle, paymentMethod, taxRate, restaurantName, address, fssai);
                triggerPrint(billContent);
            }
            setSettlingOrder(null);
        } else {
            console.error("Could not find order to settle with ID:", orderId);
            setSettlingOrder(null);
        }
    };
    
    const handleAcceptQrOrder = (orderId: number) => {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
            onUpdateOrder({ ...updatedOrder, status: 'Preparation', type: 'Offline' });
        }
    };

    const handlePrintKot = (order: OrderStatusItem) => {
        let kotContent = `
            <style>
                body { font-family: 'Courier New', monospace; font-size: 10pt; width: 80mm; margin: 0; padding: 5px; }
                h3, p { text-align: center; margin: 2px 0; }
                hr { border: none; border-top: 1px dashed black; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { padding: 2px; text-align: left;}
            </style>
            <h3>ONLINE QR ORDER KOT</h3>
            <p>Order Source: ${order.sourceInfo}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <hr>
            <table>
                <thead><tr><th>Item</th><th>Qty</th></tr></thead>
                <tbody>
                    ${order.items.map(item => `<tr><td>${item.name}</td><td style="text-align:center;">${item.quantity}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
        triggerPrint(kotContent);
    };


    return (
        <div className="touch-none">
            {showTodaysOrders && <TodaysOrdersModal orders={todaysOrders} onClose={() => setShowTodaysOrders(false)} />}
            
            {showPendingOrdersModal && <PendingOrdersModal 
                onlineOrders={pendingOnlineOrders} 
                offlineOrders={pendingOfflineOrders} 
                onClose={() => setShowPendingOrdersModal(false)} 
                onCompleteOrder={onCompleteOrder}
                onInitiateSettle={setSettlingOrder}
                onEditOrder={setEditingOrder}
            />}

            {editingOrder && <EditOrderModal 
                order={editingOrder} 
                menuItems={menuItems}
                onClose={() => setEditingOrder(null)}
                onSave={onUpdateOrder}
                taxRate={taxRate}
            />}

            {settlingOrder && <SettleBillModal
                order={settlingOrder}
                onClose={() => setSettlingOrder(null)}
                onSettle={handleSettleAndPrint}
            />}

            <div className="space-y-6">
                
                {/* Unified Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="cursor-pointer" onClick={() => setShowTodaysOrders(true)}>
                        <StatCard title="Online Sales" value={`₹${data.onlineSales.toFixed(0)}`} subtext={`${data.onlineOrders} Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>} />
                    </div>
                    <div className="cursor-pointer" onClick={() => setShowTodaysOrders(true)}>
                        <StatCard title="Offline Sales" value={`₹${data.offlineSales.toFixed(0)}`} subtext={`${data.offlineOrders} Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>} />
                    </div>
                    <div className="cursor-pointer" onClick={() => setShowTodaysOrders(true)}>
                        <StatCard title="Net Daily" value={`₹${(data.onlineSales + data.offlineSales).toFixed(0)}`} subtext="Combined Total" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
                    </div>
                     <div className="cursor-pointer" onClick={() => setShowPendingOrdersModal(true)}>
                        <StatCard 
                            title="Active KOTs" 
                            value={pendingOrders.length.toString()} 
                            subtext="Kitchen Pipeline"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} 
                        />
                    </div>
                </div>

                <QrOrdersSection 
                    orders={incomingQrOrders} 
                    onAccept={handleAcceptQrOrder} 
                    onPrint={handlePrintKot}
                    onNavigateToQrMenu={onNavigateToQrMenu}
                />

                <div className="bg-black p-4 rounded-lg border border-gray-800">
                    <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">Platform Dispatch</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <PlatformCard name="Swiggy" logoUrl="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_288/portal/m/logo_192x192.png" linkUrl="https://partner.swiggy.com/login" />
                        <PlatformCard name="Zomato" logoUrl="https://b.zmtcdn.com/images/logo/zomato_logo_2017.png" linkUrl="https://www.zomato.com/partners/onlineordering" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
