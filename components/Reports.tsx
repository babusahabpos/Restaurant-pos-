
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ReportCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl flex flex-col justify-center h-24">
        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{title}</p>
        <p className="text-xl font-black text-white mt-1 tracking-tighter">{value}</p>
    </div>
);

// Mock data generator for different views
const getMockData = (view: string) => {
    switch(view) {
        case 'Today':
            return [
                { name: '10AM', value: 1200 },
                { name: '12PM', value: 4500 },
                { name: '02PM', value: 3800 },
                { name: '04PM', value: 2100 },
                { name: '06PM', value: 5600 },
                { name: '08PM', value: 8900 },
                { name: '10PM', value: 3400 },
            ];
        case 'Last 7 Days':
            return [
                { name: 'MON', value: 15000 },
                { name: 'TUE', value: 12000 },
                { name: 'WED', value: 18000 },
                { name: 'THU', value: 16500 },
                { name: 'FRI', value: 22000 },
                { name: 'SAT', value: 28000 },
                { name: 'SUN', value: 24000 },
            ];
        case 'This Month':
            return [
                { name: 'W1', value: 85000 },
                { name: 'W2', value: 92000 },
                { name: 'W3', value: 78000 },
                { name: 'W4', value: 105000 },
            ];
        default:
            return [];
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
        <div className="space-y-4 w-full max-w-full overflow-x-hidden touch-pan-y">
             <div className="flex flex-col gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-black uppercase text-xs tracking-widest">Revenue Analytics</h2>
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-black text-lemon text-[10px] font-black p-2 rounded-lg border border-gray-800 outline-none focus:ring-1 focus:ring-lemon uppercase"
                    >
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ReportCard title="Revenue" value={totals.total} />
                <ReportCard title="Orders" value={totals.orders} />
                <ReportCard title="Cash" value={totals.cash} />
                <ReportCard title="Digital" value={totals.online} />
            </div>

            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                <h3 className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-widest text-center">Revenue Trendline</h3>
                 <div className="w-full h-64 -ml-4 pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#374151" fontSize={9} tickLine={false} axisLine={false} fontVariant="all-small-caps" fontWeight="bold" />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{backgroundColor: '#000', border: '1px solid #374151', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold'}} 
                                itemStyle={{color: '#FFFF00'}}
                            />
                            <Bar dataKey="value" fill="#FFFF00" radius={[6, 6, 0, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Top Performers</h3>
                <div className="overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-gray-600 border-b border-gray-800">
                                <th className="pb-3 font-black uppercase text-[9px]">Item Name</th>
                                <th className="pb-3 font-black uppercase text-[9px] text-right">Units</th>
                                <th className="pb-3 font-black uppercase text-[9px] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {[
                                { name: 'Margherita Pizza', q: 45, t: 12500 },
                                { name: 'Paneer Wrap', q: 38, t: 8400 },
                                { name: 'Coke 300ml', q: 120, t: 4800 },
                                { name: 'Veg Burger', q: 56, t: 7200 }
                            ].map(item => (
                                <tr key={item.name} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 text-white font-bold text-[10px] uppercase tracking-tighter">{item.name}</td>
                                    <td className="py-4 text-gray-400 text-right font-mono text-[10px]">{item.q}</td>
                                    <td className="py-4 text-lemon font-black text-right text-[11px]">₹{item.t.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
