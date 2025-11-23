import React, { useState } from 'react';
import { DashboardData, OrderStatusItem } from '../types';

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

const createBillContent = (order: OrderStatusItem, paymentMethod: string) => {
    // Assuming 5% total tax (2.5% CGST + 2.5% SGST) was applied to get order.total
    const subtotal = order.type === 'Offline' ? order.total / 1.05 : order.total;
    const cgst = order.type === 'Offline' ? subtotal * 0.025 : 0;
    const sgst = order.type === 'Offline' ? subtotal * 0.025 : 0;

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
            <h2>BaBu SAHAB</h2>
            <p>123 Food Street, Culinary City, 400001</p>
            <p>GSTIN: 27ABCDE1234F1Z5</p>
        </div>
        <hr>
        <p><strong>Order:</strong> ${order.sourceInfo}</p>
        <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
        <p><strong>Payment Mode:</strong> ${paymentMethod}</p>
        <hr>
        <table class="items">
            <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td class="center">${item.quantity}</td>
                        <td class="right">₹${(item.offlinePrice || item.onlinePrice).toFixed(2)}</td>
                        <td class="right">₹${((item.offlinePrice || item.onlinePrice) * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <hr>
        <table class="totals">
            <tbody>
                <tr><td>Subtotal</td><td>₹${subtotal.toFixed(2)}</td></tr>
                ${order.type === 'Offline' ? `
                <tr><td>CGST (2.5%)</td><td>₹${cgst.toFixed(2)}</td></tr>
                <tr><td>SGST (2.5%)</td><td>₹${sgst.toFixed(2)}</td></tr>
                ` : ''}
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

const SettleBillModal: React.FC<{
    order: OrderStatusItem;
    onClose: () => void;
    onSettle: (orderId: number, paymentMethod: string) => void;
}> = ({ order, onClose, onSettle }) => {
    const paymentMethods = ['Cash', 'PhonePe', 'Google Pay'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Settle Bill</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="flex justify-between text-gray-400">
                            <span>Order:</span>
                            <span className="font-semibold text-white">{order.sourceInfo}</span>
                        </div>
                         <div className="flex justify-between text-gray-400 mt-2">
                            <span>Total Amount:</span>
                            <span className="font-bold text-2xl text-lemon">₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-400">Select Payment Method</p>
                    <div className="grid grid-cols-1 gap-3">
                        {paymentMethods.map(method => (
                             <button
                                key={method}
                                onClick={() => onSettle(order.id, method)}
                                className="w-full bg-lemon hover:bg-lemon-dark text-black font-bold py-3 px-4 rounded-lg transition-colors"
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
}> = ({ onlineOrders, offlineOrders, onClose, onCompleteOrder, onInitiateSettle }) => {
    const [activeTab, setActiveTab] = useState<'Online' | 'Offline'>('Online');

    const ordersToShow = activeTab === 'Online' ? onlineOrders : offlineOrders;
    
    const renderOrderList = (orders: OrderStatusItem[]) => {
        if (orders.length === 0) {
            return <p className="text-center py-10 text-gray-500">No pending {activeTab.toLowerCase()} orders.</p>;
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
                            <tr key={order.id} className="bg-black border-gray-800 block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none overflow-hidden shadow-lg md:shadow-none">
                                <td className="px-4 py-2 md:px-6 md:py-4 font-medium text-white block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Order Info</span>{order.sourceInfo}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Time</span>{new Date(order.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 text-xs block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Items</span>{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b border-gray-800 md:border-b-0"><span className="float-left font-bold md:hidden">Total</span>₹{order.total.toFixed(2)}</td>
                                <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap block md:table-cell text-right md:text-left">
                                    <span className="float-left font-bold md:hidden">Actions</span>
                                    {activeTab === 'Offline' && (
                                        <button
                                            onClick={() => onInitiateSettle(order)}
                                            className="bg-lemon hover:bg-lemon-dark text-black font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Generate Bill
                                        </button>
                                    )}
                                    {activeTab === 'Online' && (
                                        <button
                                            onClick={() => onCompleteOrder(order.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Complete
                                        </button>
                                    )}
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
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Pending Orders</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                
                <div className="flex border-b border-gray-800 mb-4">
                    <button 
                        onClick={() => setActiveTab('Online')}
                        className={`py-2 px-4 transition-colors duration-300 ${activeTab === 'Online' ? 'text-lemon border-b-2 border-lemon font-semibold' : 'text-gray-400 hover:text-white'}`}
                    >
                        Online ({onlineOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('Offline')}
                        className={`py-2 px-4 transition-colors duration-300 ${activeTab === 'Offline' ? 'text-lemon border-b-2 border-lemon font-semibold' : 'text-gray-400 hover:text-white'}`}
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
    <div className="bg-black p-6 rounded-lg shadow-sm border border-gray-800 flex justify-between items-center">
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-xs mt-1">{subtext}</p>
        </div>
        <div className="text-gray-500">{icon}</div>
    </div>
);

const PlatformCard: React.FC<{ name: string; logoUrl: string; }> = ({ name, logoUrl }) => (
    <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center space-y-2 h-40 border border-gray-200 shadow-sm">
        <img src={logoUrl} alt={`${name} logo`} className="h-16 w-16 object-contain" />
        <span className="text-black font-semibold">{name}</span>
    </div>
);

const Dashboard: React.FC<{ data: DashboardData; orders: OrderStatusItem[]; onCompleteOrder: (orderId: number) => void; }> = ({ data, orders, onCompleteOrder }) => {
    const [showTodaysOrders, setShowTodaysOrders] = useState(false);
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);
    const [settlingOrder, setSettlingOrder] = useState<OrderStatusItem | null>(null);

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
            const billContent = createBillContent(orderToSettle, paymentMethod);
            triggerPrint(billContent);
            setSettlingOrder(null);
        } else {
            console.error("Could not find order to settle with ID:", orderId);
            setSettlingOrder(null);
        }
    };

    return (
        <>
            {showTodaysOrders && <TodaysOrdersModal orders={todaysOrders} onClose={() => setShowTodaysOrders(false)} />}
            
            {showPendingOrdersModal && <PendingOrdersModal 
                onlineOrders={pendingOnlineOrders} 
                offlineOrders={pendingOfflineOrders} 
                onClose={() => setShowPendingOrdersModal(false)} 
                onCompleteOrder={onCompleteOrder}
                onInitiateSettle={setSettlingOrder}
            />}

            {settlingOrder && <SettleBillModal
                order={settlingOrder}
                onClose={() => setSettlingOrder(null)}
                onSettle={handleSettleAndPrint}
            />}

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="cursor-pointer" onClick={() => setShowTodaysOrders(true)}>
                        <StatCard title="Today's Online Sales" value={`₹${data.onlineSales.toFixed(2)}`} subtext={`${data.onlineOrders} Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>} />
                    </div>
                    <div className="cursor-pointer" onClick={() => setShowTodaysOrders(true)}>
                        <StatCard title="Today's Offline Sales" value={`₹${data.offlineSales.toFixed(2)}`} subtext={`${data.offlineOrders} Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>} />
                    </div>
                    <div className="cursor-pointer" onClick={() => setShowTodaysOrders(true)}>
                        <StatCard title="Total Sales Today" value={`₹${(data.onlineSales + data.offlineSales).toFixed(2)}`} subtext={`${data.onlineOrders + data.offlineOrders} Total Orders`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
                    </div>
                     <div className="cursor-pointer" onClick={() => setShowPendingOrdersModal(true)}>
                        <StatCard 
                            title="Pending Orders" 
                            value={pendingOrders.length.toString()} 
                            subtext={`Online: ${pendingOnlineOrders.length}, Offline: ${pendingOfflineOrders.length}`}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} 
                        />
                    </div>
                </div>

                {/* Online Platforms */}
                <div className="bg-black p-6 rounded-lg shadow-sm border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Online Platforms</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <PlatformCard name="Swiggy" logoUrl="https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/1200px-Swiggy_logo.svg.png" />
                        <PlatformCard name="Zomato" logoUrl="https://b.zmtcdn.com/images/logo/zomato_logo_2017.png" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;