import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SALES_BREAKDOWN_DATA } from '../constants';

const ReportCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
);

const itemWiseSales = [
    { name: 'Margherita Pizza', quantity: 23, total: 300.00 },
    { name: 'Caesar Salad', quantity: 20, total: 150.00 },
    { name: 'Spaghetti Carbonara', quantity: 10, total: 150.00 },
    { name: 'Bruschetta', quantity: 13, total: 100.00 },
    { name: 'Chicken Wings', quantity: 23, total: 250.00 },
];

const Reports: React.FC = () => {
    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-gray-900 p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-4">
                    <select className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700">
                        <option>Last 7 Days</option>
                        <option>Today</option>
                        <option>This Month</option>
                    </select>
                    <input type="date" className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700" defaultValue="2025-06-20" />
                    <span className="text-gray-500">to</span>
                    <input type="date" className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700" defaultValue="2025-06-26" />
                </div>
                <button className="w-full md:w-auto bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark transition">
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard title="Total Sales" value="₹7850.50" />
                <ReportCard title="Cash Sales" value="₹3200.00" />
                <ReportCard title="Card Sales" value="₹2650.50" />
                <ReportCard title="Online Sales" value="₹2000.00" />
            </div>

            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Sales Breakdown Chart</h3>
                 <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={SALES_BREAKDOWN_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip wrapperClassName="!bg-black !border-gray-800 !rounded-lg" contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} labelStyle={{color: '#d1d5db'}} />
                            <Bar dataKey="value" name="Sales" fill="#FFFF00" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Item-wise Sales Report</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Item Name</th>
                                <th scope="col" className="px-6 py-3">Quantity Sold</th>
                                <th scope="col" className="px-6 py-3">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemWiseSales.map(item => (
                                <tr key={item.name} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.name}</th>
                                    <td className="px-6 py-4">{item.quantity}</td>
                                    <td className="px-6 py-4">₹{item.total.toFixed(2)}</td>
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