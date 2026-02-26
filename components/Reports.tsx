
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { OrderStatusItem } from '../types';

interface ReportsProps {
    orders: OrderStatusItem[];
    restaurantName: string;
}

const ReportCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-center h-20">
        <p className="text-gray-500 text-[8px] uppercase font-black tracking-[0.2em]">{title}</p>
        <p className="text-lg font-black text-white mt-1 tracking-tighter">{value}</p>
    </div>
);

const Reports: React.FC<ReportsProps> = ({ orders = [], restaurantName }) => {
    const [filter, setFilter] = useState('Last 7 Days');

    const getBusinessDateString = (date: Date) => {
        const d = new Date(date.getTime());
        d.setHours(d.getHours() - 4);
        return d.toDateString();
    };

    const handleSendDailyReport = () => {
        const currentBusinessDay = getBusinessDateString(new Date());
        const reportOrders = orders.filter(o => getBusinessDateString(new Date(o.timestamp)) === currentBusinessDay && o.status === 'Completed');
        
        const onlineSales = reportOrders.filter(o => o.type === 'Online').reduce((s, o) => s + o.total, 0);
        const offlineSales = reportOrders.filter(o => o.type === 'Offline').reduce((s, o) => s + o.total, 0);
        const totalSales = onlineSales + offlineSales;

        let reportText = `*DAILY SALES REPORT*\n`;
        reportText += `*Restaurant:* ${restaurantName}\n`;
        reportText += `*Business Day:* ${currentBusinessDay}\n`;
        reportText += `--------------------------\n`;
        reportText += `*Online Sales:* ₹${onlineSales.toFixed(0)}\n`;
        reportText += `*Offline Sales:* ₹${offlineSales.toFixed(0)}\n`;
        reportText += `*Total Sales:* ₹${totalSales.toFixed(0)}\n`;
        reportText += `*Total Orders:* ${reportOrders.length}\n`;
        reportText += `--------------------------\n`;
        reportText += `Generated at: ${new Date().toLocaleString()}`;

        const encodedText = encodeURIComponent(reportText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    };
    
    // Filter completed orders
    const completedOrders = useMemo(() => orders.filter(o => o.status === 'Completed'), [orders]);

    const chartData = useMemo(() => {
        const dataMap: Record<string, number> = {};
        const now = new Date();

        if (filter === 'Today') {
            for (let i = 0; i < 24; i += 2) {
                const hourLabel = `${i < 10 ? '0' : ''}${i}:00`;
                dataMap[hourLabel] = 0;
            }
            completedOrders.forEach(o => {
                const d = new Date(o.timestamp);
                if (d.toDateString() === now.toDateString()) {
                    const hour = d.getHours();
                    const slot = `${Math.floor(hour / 2) * 2}`;
                    const label = `${slot.padStart(2, '0')}:00`;
                    dataMap[label] = (dataMap[label] || 0) + o.total;
                }
            });
        } else if (filter === 'Last 7 Days') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                dataMap[dayLabel] = 0;
            }
            completedOrders.forEach(o => {
                const d = new Date(o.timestamp);
                const diffTime = Math.abs(now.getTime() - d.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 7) {
                    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    dataMap[dayLabel] = (dataMap[dayLabel] || 0) + o.total;
                }
            });
        } else {
            completedOrders.forEach(o => {
                const monthLabel = new Date(o.timestamp).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                dataMap[monthLabel] = (dataMap[monthLabel] || 0) + o.total;
            });
        }

        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    }, [completedOrders, filter]);
    
    const totals = useMemo(() => {
        const revenue = completedOrders.reduce((acc, curr) => acc + curr.total, 0);
        const cashOrders = completedOrders.filter(o => o.deliveryDetails?.paymentMethod === 'Cash');
        const onlineOrders = completedOrders.filter(o => o.type === 'Online');
        
        return {
            total: `₹${revenue.toLocaleString()}`,
            cash: `₹${cashOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}`,
            online: `₹${onlineOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}`,
            orders: completedOrders.length.toString()
        };
    }, [completedOrders]);

    const velocityItems = useMemo(() => {
        const itemMap: Record<string, { q: number, t: number }> = {};
        completedOrders.forEach(o => {
            o.items.forEach(item => {
                if (!itemMap[item.name]) itemMap[item.name] = { q: 0, t: 0 };
                itemMap[item.name].q += item.quantity;
                itemMap[item.name].t += (Number(item.offlinePrice || item.onlinePrice) || 0) * item.quantity;
            });
        });
        return Object.entries(itemMap)
            .sort((a, b) => b[1].q - a[1].q)
            .slice(0, 3)
            .map(([name, stats]) => ({ name, ...stats }));
    }, [completedOrders]);

    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-24 px-4 space-y-6">
            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white font-black uppercase text-[10px] tracking-widest">Revenue Hub</h2>
                        <button 
                            onClick={handleSendDailyReport}
                            className="bg-green-600/10 text-green-500 text-[9px] font-black px-3 py-2 rounded-xl border border-green-600/20 hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            WhatsApp Report
                        </button>
                    </div>
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-black text-lemon text-[9px] font-black p-2 rounded-xl border border-gray-800 outline-none focus:ring-1 focus:ring-lemon uppercase tracking-widest"
                    >
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <ReportCard title="Total Revenue" value={totals.total} />
                <ReportCard title="Completed Orders" value={totals.orders} />
                <ReportCard title="Cash Income" value={totals.cash} />
                <ReportCard title="Online Sales" value={totals.online} />
            </div>

            <div className="bg-black p-4 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden min-h-[300px] flex flex-col">
                <h3 className="text-[8px] font-black text-gray-600 uppercase mb-4 tracking-[0.2em] text-center">Sales Performance</h3>
                 <div className="flex-1 w-full h-64 -ml-4 pr-4">
                    {chartData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#374151" fontSize={8} tickLine={false} axisLine={false} fontVariant="all-small-caps" fontWeight="bold" />
                                <YAxis hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', border: '1px solid #374151', borderRadius: '12px', fontSize: '9px', fontWeight: 'bold'}} itemStyle={{color: '#FFFF00'}} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#FFFF00' : '#222222'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-800 font-black text-[10px] uppercase italic">No sales data found for this period</div>
                    )}
                </div>
            </div>

             <div className="bg-gray-900/30 p-4 rounded-2xl border border-gray-800 shadow-2xl">
                <h3 className="text-[8px] font-black text-gray-500 uppercase mb-4 tracking-widest">Top Selling Items</h3>
                <div className="space-y-3">
                    {velocityItems.length > 0 ? velocityItems.map(item => (
                        <div key={item.name} className="flex justify-between items-center border-b border-white/5 pb-2">
                            <div>
                                <p className="text-white font-black text-[10px] uppercase tracking-tighter">{item.name}</p>
                                <p className="text-gray-600 text-[8px] font-bold uppercase">{item.q} Units Sold</p>
                            </div>
                            <p className="text-lemon font-black text-xs">₹{item.t.toLocaleString()}</p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-700 font-bold uppercase text-[9px] py-4">No item sales recorded yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
