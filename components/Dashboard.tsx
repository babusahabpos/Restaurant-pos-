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

    if (order.type === 'Offline') {
        const totalIncludingTax = order.total + discount;
        subtotal = totalIncludingTax / (1 + taxRate / 100);
        taxAmount = totalIncludingTax - subtotal;
    } else {
        if (order.deliveryDetails) {
            deliveryCharge = order.deliveryDetails.deliveryCharge;
            const totalBeforeDelivery = order.total - deliveryCharge + discount;
            subtotal = totalBeforeDelivery / (1 + taxRate / 100);
            taxAmount = totalBeforeDelivery - subtotal;
        } else {
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
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase text-lemon tracking-widest">Today's Sales Log</h3>
                    <button onClick={onClose} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto no-scrollbar">
                    {orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                                <div key={order.id} className="bg-black/50 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-black uppercase text-lemon">{order.sourceInfo}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(order.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lemon font-black">₹{order.total.toFixed(0)}</p>
                                        <p className={`text-[9px] font-bold uppercase ${order.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>{order.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-20 text-gray-700 font-bold uppercase text-xs text-lemon">No orders processed yet</p>
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
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase text-white tracking-widest">Update Order</h3>
                    <button onClick={onClose} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <h4 className="text-lemon font-black mb-3 uppercase text-[10px] tracking-widest">Cart Items</h4>
                        <div className="space-y-2">
                        {editedItems.map(item => (
                            <div key={item.id} className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="text-white text-[11px] font-black uppercase truncate">{item.name}</p>
                                    <p className="text-gray-500 text-[9px]">₹{item[priceType]}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold">-</button>
                                    <span className="text-white text-xs font-black w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold">+</button>
                                    <button onClick={() => removeFromOrder(item.id)} className="ml-2 text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                         <h4 className="text-lemon font-black mb-3 uppercase text-[10px] tracking-widest">Add New</h4>
                         <input 
                            type="text" 
                            placeholder="SEARCH MENU..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-black/50 text-white p-3 rounded-xl mb-3 text-[11px] border border-gray-800 focus:border-lemon outline-none font-bold"
                        />
                        <div className="overflow-y-auto no-scrollbar flex-1 space-y-1">
                            {filteredMenu.map(item => (
                                <div key={item.id} onClick={() => addToOrder(item)} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex justify-between items-center cursor-pointer transition-colors active:scale-95">
                                    <span className="text-white text-[10px] uppercase font-bold truncate">{item.name}</span>
                                    <span className="text-lemon text-[10px] font-black">₹{item[priceType]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase">Grand Total</p>
                        <p className="text-2xl text-lemon font-black tracking-tighter">₹{calculateTotal().toFixed(2)}</p>
                    </div>
                    <button onClick={handleSave} className="bg-lemon text-black font-black px-8 py-3 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/20">
                        Confirm Changes
                    </button>
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
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase text-lemon tracking-widest">Final Bill</h3>
                    <button onClick={onClose} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                <div className="space-y-6">
                    <div className="bg-black/50 p-6 rounded-2xl border border-gray-800 text-center">
                         <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Amount Payable</p>
                         <p className="text-4xl font-black text-lemon tracking-tighter">₹{order.total.toFixed(0)}</p>
                         {order.discount && order.discount > 0 && <p className="text-[10px] text-green-500 font-bold uppercase mt-2">Discount Applied: ₹{order.discount.toFixed(0)}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {paymentMethods.map(method => (
                             <button
                                key={method}
                                onClick={() => onSettle(order.id, method)}
                                className="w-full bg-lemon hover:bg-lemon-dark text-black font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg shadow-lemon/10"
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
    
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black uppercase text-white tracking-widest">Kitchen Pipeline</h3>
                    <button onClick={onClose} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                
                <div className="flex gap-2 border-b border-gray-800 mb-6 pb-2">
                    <button 
                        onClick={() => setActiveTab('Online')}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'Online' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}
                    >
                        Online ({onlineOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('Offline')}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'Offline' ? 'bg-lemon text-black shadow-lg' : 'text-gray-500'}`}
                    >
                        Offline ({offlineOrders.length})
                    </button>
                </div>

                <div className="overflow-y-auto no-scrollbar space-y-4">
                    {ordersToShow.length > 0 ? (
                        ordersToShow.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                            <div key={order.id} className="bg-black/50 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lemon font-black uppercase text-xs">{order.sourceInfo}</span>
                                        <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(order.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic line-clamp-1">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                                    <p className="text-lg font-black text-white mt-1">₹{order.total.toFixed(0)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onEditOrder(order)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/50 text-[10px] font-black uppercase">Edit</button>
                                    {activeTab === 'Offline' ? (
                                        <button onClick={() => onInitiateSettle(order)} className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-lemon text-black text-[10px] font-black uppercase">Bill</button>
                                    ) : (
                                        <button onClick={() => onCompleteOrder(order.id)} className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-green-600 text-white text-[10px] font-black uppercase">Done</button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-20 text-gray-700 font-bold uppercase text-[10px]">No active KOTs in this section</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-black p-5 rounded-2xl border border-gray-800 flex justify-between items-center h-28 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:scale-[1.8] transition-transform duration-500">
            {icon}
        </div>
        <div className="flex flex-col justify-between h-full relative z-10">
            <p className="text-[10px] text-lemon font-black uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-lemon tracking-tighter">{value}</p>
            <p className="text-lemon/60 text-[9px] font-bold uppercase mt-1">{subtext}</p>
        </div>
        <div className="text-lemon/30 relative z-10">{icon}</div>
    </div>
);

const PlatformCard: React.FC<{ name: string; logoUrl: string; linkUrl: string }> = ({ name, logoUrl, linkUrl }) => (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block h-32">
        <div className="bg-white/95 h-full p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-800 transition-all hover:scale-[1.02] hover:shadow-2xl grayscale hover:grayscale-0 active:scale-95">
            <img src={logoUrl} alt={`${name} logo`} className="h-14 w-14 object-contain" />
            <span className="text-black font-black uppercase text-[10px] tracking-widest">{name} Partner</span>
        </div>
    </a>
);

const QrOrdersSection: React.FC<{ 
    orders: OrderStatusItem[]; 
    onAccept: (orderId: number) => void;
    onPrint: (order: OrderStatusItem) => void;
    onNavigateToQrMenu: () => void;
}> = ({ orders, onAccept, onPrint, onNavigateToQrMenu }) => {
    
    useEffect(() => {
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        let interval: any;
        if (orders.length > 0 && audio) {
            audio.play().catch(() => {});
            interval = setInterval(() => { audio.play().catch(() => {}); }, 5000);
        }
        return () => clearInterval(interval);
    }, [orders.length]);

    if (orders.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-lemon/10 p-4 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lemon"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-black text-lemon uppercase tracking-tight">QR Live Channel</h3>
                        <p className="text-lemon/50 text-[10px] font-bold uppercase tracking-widest">Active & listening for customer orders</p>
                    </div>
                </div>
                <button onClick={onNavigateToQrMenu} className="w-full sm:w-auto bg-lemon text-black font-black uppercase text-[10px] px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95">
                    Show QR Poster
                </button>
            </div>
        );
    }

    return (
        <div className="animate-alert-border border-4 p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-2xl font-black text-lemon uppercase tracking-tighter flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
                New QR Orders ({orders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-black p-5 rounded-2xl border border-gray-800 shadow-2xl flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="font-black text-lemon text-xl uppercase tracking-tighter">{order.sourceInfo}</span>
                                <span className="text-[9px] font-black bg-gray-800 text-lemon px-3 py-1 rounded-full">{new Date(order.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="space-y-1 mb-4">
                                {order.items.map((item, idx) => (
                                    <p key={idx} className="text-[11px] font-bold text-lemon/80 uppercase italic border-b border-white/5 pb-1">{item.name} x {item.quantity}</p>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="font-black text-lemon text-2xl tracking-tighter text-right mb-4">₹{order.total.toFixed(0)}</p>
                            <div className="flex gap-2">
                                <button onClick={() => onAccept(order.id)} className="flex-1 bg-green-600 text-white font-black py-3 rounded-xl text-[10px] uppercase active:scale-95">Accept</button>
                                <button onClick={() => { onPrint(order); onAccept(order.id); }} className="flex-1 bg-lemon text-black font-black py-3 rounded-xl text-[10px] uppercase active:scale-95">Print KOT</button>
                            </div>
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
    
    const todaysOrdersProcessed = orders.filter(o => {
      const d = new Date(o.timestamp); const t = new Date();
      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    });

    const handleSettleAndPrint = (orderId: number, paymentMethod: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            onCompleteOrder(orderId);
            if (isPrinterEnabled) triggerPrint(createBillContent(order, paymentMethod, taxRate, restaurantName, address, fssai));
            setSettlingOrder(null);
        }
    };
    
    const handleAcceptQrOrder = (orderId: number) => {
        const order = orders.find(o => o.id === orderId);
        if (order) onUpdateOrder({ ...order, status: 'Preparation', type: 'Offline' });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {showTodaysOrders && <TodaysOrdersModal orders={todaysOrdersProcessed} onClose={() => setShowTodaysOrders(false)} />}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setShowTodaysOrders(true)}>
                    <StatCard title="Online Sales" value={`₹${data.onlineSales.toFixed(0)}`} subtext={`${data.onlineOrders} Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>} />
                </div>
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setShowTodaysOrders(true)}>
                    <StatCard title="Offline Sales" value={`₹${data.offlineSales.toFixed(0)}`} subtext={`${data.offlineOrders} Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>} />
                </div>
                <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setShowTodaysOrders(true)}>
                    <StatCard title="Today's Cash" value={`₹${(data.onlineSales + data.offlineSales).toFixed(0)}`} subtext="Daily Total" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
                </div>
                 <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setShowPendingOrdersModal(true)}>
                    <StatCard title="Kitchen Pipe" value={pendingOrders.length.toString()} subtext="Active KOTs" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} />
                </div>
            </div>

            <QrOrdersSection orders={incomingQrOrders} onAccept={handleAcceptQrOrder} onPrint={() => {}} onNavigateToQrMenu={onNavigateToQrMenu} />

            <div className="bg-black border border-gray-800 p-5 rounded-2xl">
                <h3 className="text-[11px] font-black text-lemon mb-6 uppercase tracking-[0.2em] text-center">Connected Delivery Platforms</h3>
                <div className="grid grid-cols-2 gap-4">
                    <PlatformCard name="Swiggy" logoUrl="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_288/portal/m/logo_192x192.png" linkUrl="https://partner.swiggy.com/login" />
                    <PlatformCard name="Zomato" logoUrl="https://b.zmtcdn.com/images/logo/zomato_logo_2017.png" linkUrl="https://www.zomato.com/partners/onlineordering" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;