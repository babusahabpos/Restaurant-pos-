
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ReportCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{title}</p>
        <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
);

// Mock data generator for different views
const getMockData = (view: string) => {
    switch(view) {
        case 'Today':
            return [
                { name: '10am', value: 1200 },
                { name: '12pm', value: 4500 },
                { name: '2pm', value: 3800 },
                { name: '4pm', value: 2100 },
                { name: '6pm', value: 5600 },
                { name: '8pm', value: 8900 },
                { name: '10pm', value: 3400 },
            ];
        case 'Last 7 Days':
            return [
                { name: 'Mon', value: 15000 },
                { name: 'Tue', value: 12000 },
                { name: 'Wed', value: 18000 },
                { name: 'Thu', value: 16500 },
                { name: 'Fri', value: 22000 },
                { name: 'Sat', value: 28000 },
                { name: 'Sun', value: 24000 },
            ];
        case 'This Month':
            return [
                { name: 'Week 1', value: 85000 },
                { name: 'Week 2', value: 92000 },
                { name: 'Week 3', value: 78000 },
                { name: 'Week 4', value: 105000 },
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
            total: `₹${val.toLocaleString()}`,
            cash: `₹${(val * 0.4).toLocaleString()}`,
            online: `₹${(val * 0.6).toLocaleString()}`,
            orders: Math.floor(val / 350).toString()
        };
    }, [chartData]);

    return (
        <div className="space-y-4 max-w-full overflow-hidden">
             <div className="flex flex-col gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold">Sales Overview</h2>
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-gray-800 text-white text-xs p-2 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-lemon"
                    >
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ReportCard title="Total Sales" value={totals.total} />
                <ReportCard title="Total Orders" value={totals.orders} />
                <ReportCard title="Cash/Card" value={totals.cash} />
                <ReportCard title="Online Sales" value={totals.online} />
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Revenue Growth ({filter})</h3>
                 <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{fill: '#1f2937'}}
                                contentStyle={{backgroundColor: '#000', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px'}} 
                                itemStyle={{color: '#FFFF00'}}
                            />
                            <Bar dataKey="value" fill="#FFFF00" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Top Selling Items</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="pb-2 font-bold uppercase">Item</th>
                                <th className="pb-2 font-bold uppercase text-right">Qty</th>
                                <th className="pb-2 font-bold uppercase text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {[
                                { name: 'Margherita Pizza', q: 45, t: 12500 },
                                { name: 'Paneer Wrap', q: 38, t: 8400 },
                                { name: 'Coke 300ml', q: 120, t: 4800 },
                                { name: 'Veg Burger', q: 56, t: 7200 }
                            ].map(item => (
                                <tr key={item.name} className="hover:bg-gray-800/50">
                                    <td className="py-3 text-white font-medium">{item.name}</td>
                                    <td className="py-3 text-gray-400 text-right">{item.q}</td>
                                    <td className="py-3 text-lemon font-bold text-right">₹{item.t.toLocaleString()}</td>
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
