
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ReportCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-center h-20">
        <p className="text-gray-500 text-[8px] uppercase font-black tracking-[0.2em]">{title}</p>
        <p className="text-lg font-black text-white mt-1 tracking-tighter">{value}</p>
    </div>
);

const getMockData = (view: string) => {
    switch(view) {
        case 'Today':
            return [
                { name: '10A', value: 1200 }, { name: '12P', value: 4500 }, { name: '02P', value: 3800 },
                { name: '04P', value: 2100 }, { name: '06P', value: 5600 }, { name: '08P', value: 8900 },
                { name: '10P', value: 3400 },
            ];
        case 'Last 7 Days':
            return [
                { name: 'MON', value: 15000 }, { name: 'TUE', value: 12000 }, { name: 'WED', value: 18000 },
                { name: 'THU', value: 16500 }, { name: 'FRI', value: 22000 }, { name: 'SAT', value: 28000 },
                { name: 'SUN', value: 24000 },
            ];
        case 'This Month':
            return [
                { name: 'W1', value: 85000 }, { name: 'W2', value: 92000 },
                { name: 'W3', value: 78000 }, { name: 'W4', value: 105000 },
            ];
        default: return [];
    }
};

const Reports: React.FC = () => {
    const [filter, setFilter] = useState('Last 7 Days');
    const chartData = useMemo(() => getMockData(filter), [filter]);
    
    const totals = useMemo(() => {
        const val = chartData.reduce((acc, curr) => acc + curr.value, 0);
        return {
            total: `₹${(val/1000).toFixed(1)}K`,
            cash: `₹${((val * 0.4)/1000).toFixed(1)}K`,
            online: `₹${((val * 0.6)/1000).toFixed(1)}K`,
            orders: Math.floor(val / 350).toString()
        };
    }, [chartData]);

    return (
        <div className="space-y-4 max-w-full">
             <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-black uppercase text-[10px] tracking-widest">Revenue Hub</h2>
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-black text-lemon text-[9px] font-black p-2 rounded-xl border border-gray-800 outline-none focus:ring-1 focus:ring-lemon uppercase tracking-widest"
                    >
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <ReportCard title="Revenue" value={totals.total} />
                <ReportCard title="Orders" value={totals.orders} />
                <ReportCard title="Cash" value={totals.cash} />
                <ReportCard title="Market" value={totals.online} />
            </div>

            <div className="bg-black p-4 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden h-72 flex flex-col">
                <h3 className="text-[8px] font-black text-gray-600 uppercase mb-4 tracking-[0.2em] text-center">Volume Trendline</h3>
                 <div className="flex-1 w-full -ml-4 pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#374151" fontSize={8} tickLine={false} axisLine={false} fontVariant="all-small-caps" fontWeight="bold" />
                            <YAxis hide />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', border: '1px solid #374151', borderRadius: '12px', fontSize: '9px', fontWeight: 'bold'}} itemStyle={{color: '#FFFF00'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#FFFF00' : '#222222'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-gray-900/30 p-4 rounded-2xl border border-gray-800 shadow-2xl">
                <h3 className="text-[8px] font-black text-gray-500 uppercase mb-4 tracking-widest">Velocity Items</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Margherita Pizza', q: 45, t: 12500 },
                        { name: 'Paneer Wrap', q: 38, t: 8400 },
                        { name: 'Coke 300ml', q: 120, t: 4800 }
                    ].map(item => (
                        <div key={item.name} className="flex justify-between items-center border-b border-white/5 pb-2">
                            <div>
                                <p className="text-white font-black text-[10px] uppercase tracking-tighter">{item.name}</p>
                                <p className="text-gray-600 text-[8px] font-bold uppercase">{item.q} Units Sold</p>
                            </div>
                            <p className="text-lemon font-black text-xs">₹{item.t.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
