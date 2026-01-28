
import React, { useState, useMemo } from 'react';
import { OrderStatusItem } from '../types';

interface CustomerOfferProps {
    orders: OrderStatusItem[];
    restaurantName: string;
}

interface CustomerRecord {
    phone: string;
    name: string;
    orderCount: number;
    totalSpend: number;
    lastOrderDate: Date;
}

const CustomerOffer: React.FC<CustomerOfferProps> = ({ orders, restaurantName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
    const [customMessage, setCustomMessage] = useState('');

    const customers = useMemo(() => {
        const customerMap: Record<string, CustomerRecord> = {};

        orders.forEach(order => {
            // Extract potential name and phone
            let phone = order.deliveryDetails?.phone?.replace(/\s/g, '') || '';
            let name = order.deliveryDetails?.customerName?.trim() || '';

            // If phone not in delivery details, try regex on sourceInfo
            if (!phone || phone.length < 10) {
                const phoneMatch = order.sourceInfo.match(/\d{10}/);
                if (phoneMatch) phone = phoneMatch[0];
            }

            // Cleanup name if it's generic
            if (!name || name === 'Guest' || name === 'Customer') {
                const nameMatch = order.sourceInfo.match(/\(([^)]+)\)/);
                if (nameMatch) name = nameMatch[1];
            }

            // Ensure we only process valid 10-digit numbers
            if (phone.length > 10) phone = phone.slice(-10);

            if (phone && /^\d{10}$/.test(phone)) {
                if (!customerMap[phone]) {
                    customerMap[phone] = {
                        phone,
                        name: name || 'Valued Customer',
                        orderCount: 0,
                        totalSpend: 0,
                        lastOrderDate: new Date(order.timestamp)
                    };
                }
                customerMap[phone].orderCount += 1;
                customerMap[phone].totalSpend += (Number(order.total) || 0);
                const orderDate = new Date(order.timestamp);
                if (orderDate > customerMap[phone].lastOrderDate) {
                    customerMap[phone].lastOrderDate = orderDate;
                }
                // Update name if a better one is found
                if (name && (customerMap[phone].name === 'Valued Customer' || customerMap[phone].name === 'Customer')) {
                    customerMap[phone].name = name;
                }
            }
        });

        return Object.values(customerMap).sort((a, b) => b.orderCount - a.orderCount);
    }, [orders]);

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    const toggleSelection = (phone: string) => {
        const newSet = new Set(selectedPhones);
        if (newSet.has(phone)) newSet.delete(phone);
        else newSet.add(phone);
        setSelectedPhones(newSet);
    };

    const toggleAll = () => {
        if (selectedPhones.size === filteredCustomers.length && filteredCustomers.length > 0) {
            setSelectedPhones(new Set());
        } else {
            setSelectedPhones(new Set(filteredCustomers.map(c => c.phone)));
        }
    };

    const sendWhatsApp = (phone: string, name: string) => {
        const msg = customMessage || `Hi ${name}, we have a special offer for you at ${restaurantName}! Visit us or order again to enjoy exclusive benefits.`;
        const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const sendBulkWhatsApp = () => {
        if (selectedPhones.size === 0) {
            alert("Please select at least one customer.");
            return;
        }
        
        const count = selectedPhones.size;
        const confirm = window.confirm(`Start broadcast to ${count} customers? This will open WhatsApp for each customer sequentially.`);
        
        if (confirm) {
            const phones = Array.from(selectedPhones);
            phones.forEach((phone, idx) => {
                const customer = customers.find(c => c.phone === phone);
                if (customer) {
                    setTimeout(() => {
                        sendWhatsApp(customer.phone, customer.name);
                    }, idx * 1200); // 1.2s delay to prevent browser blocking
                }
            });
        }
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar p-4 space-y-6 animate-fade-in pb-28">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-gray-900 p-5 rounded-[2rem] border border-gray-800 flex justify-between items-center shadow-xl">
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Database</p>
                        <p className="text-xl font-black text-white">{customers.length}</p>
                    </div>
                    <div className="text-lemon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                </div>
                <div className="bg-gray-900 p-5 rounded-[2rem] border border-gray-800 flex justify-between items-center shadow-xl">
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Selected</p>
                        <p className="text-xl font-black text-lemon">{selectedPhones.size}</p>
                    </div>
                    <div className="text-lemon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
                </div>
            </div>

            {/* Broadcast Box */}
            <div className="bg-black border-2 border-lemon p-6 rounded-[2.5rem] shadow-2xl space-y-4 shrink-0">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Broadcast Special Offer</h3>
                <textarea 
                    value={customMessage} 
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder={`Ex: "Hi! Flat 20% OFF today at ${restaurantName}. Grab it now!"`}
                    className="w-full bg-gray-900 text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm focus:border-lemon transition-colors"
                    rows={3}
                />
                <button 
                    onClick={sendBulkWhatsApp}
                    className="w-full bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-lemon/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    Send Bulk WhatsApp
                </button>
            </div>

            {/* List Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by Name or Phone..."
                        className="w-full bg-gray-900 text-white p-4 rounded-2xl border border-gray-800 outline-none pl-12 font-bold text-sm"
                    />
                    <svg className="absolute left-4 top-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <button onClick={toggleAll} className="w-full md:w-auto text-[9px] font-black uppercase text-lemon border border-lemon/30 px-6 py-3 rounded-2xl hover:bg-lemon/10">
                    {selectedPhones.size === filteredCustomers.length && filteredCustomers.length > 0 ? 'Deselect All' : 'Select All Filtered'}
                </button>
            </div>

            {/* Customer List */}
            <div className="space-y-3">
                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                    <div 
                        key={customer.phone} 
                        className={`bg-gray-900/50 p-5 rounded-[2rem] border transition-all flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-lemon/30 ${selectedPhones.has(customer.phone) ? 'border-lemon bg-lemon/5 shadow-lg shadow-lemon/5' : 'border-gray-800'}`}
                    >
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                            <div 
                                onClick={() => toggleSelection(customer.phone)}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${selectedPhones.has(customer.phone) ? 'bg-lemon border-lemon' : 'bg-black border-gray-700'}`}
                            >
                                {selectedPhones.has(customer.phone) && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-black text-sm uppercase truncate tracking-tight">{customer.name}</h4>
                                <p className="text-lemon font-bold text-[11px] font-mono">{customer.phone}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6 w-full sm:w-auto">
                            <div className="text-center sm:text-right">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">History</p>
                                <p className="text-white font-black text-xs">{customer.orderCount} Orders</p>
                                <p className="text-gray-500 text-[9px] font-bold">₹{customer.totalSpend.toFixed(0)} spent</p>
                            </div>
                            <button 
                                onClick={() => sendWhatsApp(customer.phone, customer.name)}
                                className="bg-gray-800 text-white font-black px-5 py-2.5 rounded-xl text-[9px] uppercase tracking-widest hover:bg-gray-700 active:scale-95 transition-all flex items-center gap-2 border border-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L22 2l-2 5.5Z"/></svg>
                                Offer
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center opacity-30 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <p className="font-black uppercase text-xs tracking-widest">No customer records found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOffer;
