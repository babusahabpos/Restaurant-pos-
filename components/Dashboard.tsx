import React, { useState } from 'react';
import { DashboardData, OrderStatusItem } from '../types';

const TodaysOrdersModal: React.FC<{ orders: OrderStatusItem[]; onClose: () => void }> = ({ orders, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Today's Orders</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto">
                    {orders.length > 0 ? (
                         <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0">
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
                                    <tr key={order.id} className="bg-black border-b border-gray-800">
                                        <td className="px-6 py-4 font-medium text-white">{order.sourceInfo}</td>
                                        <td className="px-6 py-4">{new Date(order.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-4 text-xs">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                                        <td className="px-6 py-4">₹{order.total.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`${order.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center py-10 text-gray-500">No orders for today yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const PendingOrdersModal: React.FC<{ 
    onlineOrders: OrderStatusItem[]; 
    offlineOrders: OrderStatusItem[]; 
    onClose: () => void 
}> = ({ onlineOrders, offlineOrders, onClose }) => {
    const [activeTab, setActiveTab] = useState<'Online' | 'Offline'>('Online');

    const ordersToShow = activeTab === 'Online' ? onlineOrders : offlineOrders;

    const renderOrderList = (orders: OrderStatusItem[]) => {
        if (orders.length === 0) {
            return <p className="text-center py-10 text-gray-500">No pending {activeTab.toLowerCase()} orders.</p>;
        }
        return (
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3">Order Info</th>
                        <th scope="col" className="px-6 py-3">Time</th>
                        <th scope="col" className="px-6 py-3">Items</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                        <tr key={order.id} className="bg-black border-b border-gray-800">
                            <td className="px-6 py-4 font-medium text-white">{order.sourceInfo}</td>
                            <td className="px-6 py-4">{new Date(order.timestamp).toLocaleTimeString()}</td>
                            <td className="px-6 py-4 text-xs">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                            <td className="px-6 py-4">₹{order.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
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
    <div className="bg-black p-4 rounded-lg flex flex-col items-center justify-center space-y-3 h-32 border border-gray-800">
        <img src={logoUrl} alt={`${name} logo`} className="h-12 w-24 object-contain" />
        <span className="text-white font-semibold">{name}</span>
    </div>
);

const Dashboard: React.FC<{ data: DashboardData; orders: OrderStatusItem[] }> = ({ data, orders }) => {
    const [showTodaysOrders, setShowTodaysOrders] = useState(false);
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);

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

    return (
        <>
            {showTodaysOrders && <TodaysOrdersModal orders={todaysOrders} onClose={() => setShowTodaysOrders(false)} />}
            {showPendingOrdersModal && <PendingOrdersModal onlineOrders={pendingOnlineOrders} offlineOrders={pendingOfflineOrders} onClose={() => setShowPendingOrdersModal(false)} />}
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <PlatformCard name="Swiggy" logoUrl="https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/1200px-Swiggy_logo.svg.png" />
                        <PlatformCard name="Zomato" logoUrl="https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;