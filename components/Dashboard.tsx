
import React, { useState, useMemo, useEffect } from 'react';
import { DashboardData, OrderStatusItem, MenuItem, OrderItem } from '../types';

const triggerPrint = (content: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write('<html><head><title>Print</title></head><body>' + content + '</body></html>');
        doc.close();
        
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    } else {
        // Fallback to window.open if iframe fails
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print</title></head><body>' + content + '</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
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
        <div class="center">
            <p><strong>THANK YOU FOR VISITING!</strong></p>
            <p>Have a great day!</p>
        </div>
    `;
};

const StatCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, subtext, icon, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-black p-5 rounded-2xl border border-gray-800 flex justify-between items-center h-28 relative overflow-hidden group transition-all ${onClick ? 'cursor-pointer active:scale-95 hover:border-lemon/50' : ''}`}
    >
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

const SettleBillModal: React.FC<{
    order: OrderStatusItem;
    onClose: () => void;
    onSettle: (orderId: number, paymentMethod: string) => void;
}> = ({ order, onClose, onSettle }) => {
    const paymentMethods = ['Cash', 'PhonePe', 'Google Pay'];
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-sm:max-w-full max-w-sm border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase text-lemon tracking-widest">Final Bill</h3>
                    <button onClick={onClose} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                <div className="space-y-6">
                    <div className="bg-black/50 p-6 rounded-2xl border border-gray-800 text-center">
                         <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Amount Payable</p>
                         <p className="text-4xl font-black text-lemon tracking-tighter">₹{order.total.toFixed(0)}</p>
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
                        <h3 className="text-lg font-black text-lemon uppercase tracking-tight">QR ORDER</h3>
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
                QR ORDER
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

const TodaysOrdersModal: React.FC<{ 
    orders: OrderStatusItem[]; 
    onClose: () => void;
    onPrintBill: (order: OrderStatusItem) => void;
}> = ({ orders, onClose, onPrintBill }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase text-lemon tracking-widest">Today's Sales Log</h3>
                    <button onClick={onClose} className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto no-scrollbar">
                    {orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                                <div key={order.id} className="bg-black/50 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase text-lemon">{order.sourceInfo}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(order.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lemon font-black">₹{order.total.toFixed(0)}</p>
                                            <p className={`text-[9px] font-bold uppercase ${order.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>{order.status}</p>
                                        </div>
                                        <button 
                                            onClick={() => onPrintBill(order)}
                                            className="p-2 bg-gray-800 text-lemon rounded-lg border border-lemon/20 hover:bg-lemon hover:text-black transition-all"
                                            title="Print Bill"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                        </button>
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

const PendingOrdersModal: React.FC<{ 
    allPendingOrders: OrderStatusItem[]; 
    onClose: () => void;
    onCompleteOrder: (orderId: number) => void;
    onInitiateSettle: (order: OrderStatusItem) => void;
    onEditOrder: (order: OrderStatusItem) => void;
    onPrintKOT: (order: OrderStatusItem) => void;
    onPrintBill: (order: OrderStatusItem) => void;
    onWhatsAppBill: (order: OrderStatusItem) => void;
}> = ({ allPendingOrders, onClose, onCompleteOrder, onInitiateSettle, onEditOrder, onPrintKOT, onPrintBill, onWhatsAppBill }) => {
    const [showBillOptions, setShowBillOptions] = useState<number | null>(null);
    
    const getOrderSourceBadge = (order: OrderStatusItem) => {
        const info = order.sourceInfo.toLowerCase();
        let label = "Other";
        let color = "bg-gray-800 text-gray-400";

        if (info.includes('swiggy')) { label = "Swiggy"; color = "bg-orange-600/20 text-orange-500"; }
        else if (info.includes('zomato')) { label = "Zomato"; color = "bg-red-600/20 text-red-500"; }
        else if (info.includes('table')) { label = "Table Order"; color = "bg-lemon/10 text-lemon"; }
        else if (info.includes('takeaway')) { label = "Takeaway"; color = "bg-blue-600/20 text-blue-400"; }
        else if (info.includes('delivery')) { label = "Delivery"; color = "bg-purple-600/20 text-purple-400"; }
        else if (order.type === 'Online') { label = "QR Order"; color = "bg-green-600/20 text-green-500"; }

        return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${color}`}>{label}</span>;
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-[60] p-4">
            <div className="bg-gray-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-800">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black uppercase text-white tracking-tighter italic">PENDING ORDERS</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Kitchen Status • Total: {allPendingOrders.length}</p>
                    </div>
                    <button onClick={onClose} className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl hover:bg-lemon hover:text-black transition-all">&times;</button>
                </div>

                <div className="overflow-y-auto no-scrollbar space-y-4 pb-6 flex-1">
                    {allPendingOrders.length > 0 ? (
                        allPendingOrders.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(order => (
                            <div key={order.id} className="bg-black/50 border border-gray-800 p-6 rounded-[2.5rem] flex flex-col gap-6 hover:border-lemon/20 transition-all group relative">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            {getOrderSourceBadge(order)}
                                            <span className="text-white font-black uppercase text-sm tracking-tighter italic">{order.sourceInfo}</span>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase ml-auto">{new Date(order.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                                            {order.items.map((i, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-lemon/50"></div>
                                                    <p className="text-[11px] text-gray-200 font-bold uppercase truncate">{i.name} <span className="text-lemon ml-1">x{i.quantity}</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-lemon tracking-tighter italic">₹{order.total.toFixed(0)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 items-center justify-end pt-4 border-t border-white/5">
                                    <button onClick={() => onPrintKOT(order)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-800 text-lemon border border-lemon/10 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                        KOT
                                    </button>
                                    
                                    <button onClick={() => onEditOrder(order)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-600/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        Edit
                                    </button>

                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowBillOptions(showBillOptions === order.id ? null : order.id)} 
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-600/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                            Generate Bill
                                        </button>
                                        
                                        {showBillOptions === order.id && (
                                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                                                <button 
                                                    onClick={() => { onPrintBill(order); setShowBillOptions(null); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-left transition-all"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lemon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase">Paper Bill</p>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase">Thermal Print</p>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => { onWhatsAppBill(order); setShowBillOptions(null); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-left transition-all"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center text-green-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase">E-Bill</p>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase">WhatsApp</p>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {order.type === 'Offline' ? (
                                        <button onClick={() => onInitiateSettle(order)} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-lemon text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-lemon/10 active:scale-95 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                            Settle
                                        </button>
                                    ) : (
                                        <button onClick={() => onCompleteOrder(order.id)} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-900/10 active:scale-95 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center opacity-30 flex flex-col items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                             <p className="font-black uppercase text-xs tracking-widest italic">All orders are cleared!</p>
                        </div>
                    )}
                </div>
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
    restaurantPhone?: string;
    menuItems: MenuItem[];
    onUpdateOrder: (updatedOrder: OrderStatusItem) => void;
    isPrinterEnabled: boolean;
    onNavigateToQrMenu: () => void;
    onNavigateToMarket?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, orders, onCompleteOrder, taxRate, restaurantName, address, fssai, restaurantPhone, menuItems, onUpdateOrder, isPrinterEnabled, onNavigateToQrMenu, onNavigateToMarket }) => {
    const [showTodaysOrders, setShowTodaysOrders] = useState(false);
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);
    const [settlingOrder, setSettlingOrder] = useState<OrderStatusItem | null>(null);
    const [editingOrder, setEditingOrder] = useState<OrderStatusItem | null>(null);
    const [editedItems, setEditedItems] = useState<OrderItem[]>([]);

    const incomingQrOrders = orders.filter(o => o.status === 'Placed');
    const pendingOrders = orders.filter(o => o.status === 'Preparation');
    
    // --- HELPER FOR 4 AM RESET LOGIC ---
    const getBusinessDateString = (date: Date) => {
        const d = new Date(date.getTime());
        d.setHours(d.getHours() - 4);
        return d.toDateString();
    };

    const todaysOrdersProcessed = orders.filter(o => {
      const currentBusinessDay = getBusinessDateString(new Date());
      return getBusinessDateString(new Date(o.timestamp)) === currentBusinessDay;
    });

    const handleStartEdit = (order: OrderStatusItem) => {
        setEditingOrder(order);
        setEditedItems([...order.items]);
    };

    const handleUpdateEditedItemQty = (id: number, delta: number) => {
        setEditedItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleAddItemToEditedOrder = (item: MenuItem) => {
        setEditedItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const handleSaveEditedOrder = () => {
        if (!editingOrder) return;
        
        const subtotal = editedItems.reduce((acc, item) => acc + (Number(item.offlinePrice || item.onlinePrice) || 0) * item.quantity, 0);
        const tax = subtotal * (taxRate / 100);
        const total = Math.max(0, subtotal + tax - (editingOrder.discount || 0));

        onUpdateOrder({
            ...editingOrder,
            items: editedItems,
            total: total
        });
        setEditingOrder(null);
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
        // Use a default phone or prompt for one? For now, we'll try to use the restaurant's phone if available, but it's not in props.
        // We'll just open WhatsApp with the text.
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    };

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
        if (order) onUpdateOrder({ ...order, status: 'Preparation' });
    };

    const handlePrintKOT = (order: OrderStatusItem) => {
        if (!isPrinterEnabled) { alert('Printer disabled in settings'); return; }
        const kotContent = `
            <style>
                body { font-family: 'Courier New', monospace; font-size: 11pt; width: 80mm; margin: 0; padding: 5px; color: black; }
                .center { text-align: center; }
                h3 { margin: 5px 0; border-bottom: 1px solid black; padding-bottom: 5px; }
                p { margin: 2px 0; }
                hr { border: none; border-top: 1px dashed black; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 4px 2px; text-align: left; }
                .qty { text-align: center; width: 50px; }
            </style>
            <div class="center">
                <h3>KITCHEN ORDER TICKET</h3>
                <p><strong>${order.sourceInfo}</strong></p>
                <p>DATE: ${new Date().toLocaleDateString()}</p>
                <p>TIME: ${new Date().toLocaleTimeString()}</p>
            </div>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>ITEM NAME</th>
                        <th class="qty">QTY</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(i => `
                        <tr>
                            <td><strong>${i.name.toUpperCase()}</strong></td>
                            <td class="qty"><strong>${i.quantity}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <hr>
            <div class="center" style="margin-top: 10px;">
                <p>*** NO PRICE ON KOT ***</p>
                <p>*** KITCHEN COPY ***</p>
            </div>
        `;
        triggerPrint(kotContent);
    };

    const handlePrintBill = (order: OrderStatusItem) => {
        if (!isPrinterEnabled) { alert('Printer disabled in settings'); return; }
        triggerPrint(createBillContent(order, order.deliveryDetails?.paymentMethod || 'Cash', taxRate, restaurantName, address, fssai));
    };

    const handleWhatsAppBill = (order: OrderStatusItem) => {
        let billText = `*${restaurantName.toUpperCase()}*\n`;
        if (address) billText += `${address}\n`;
        if (fssai) billText += `FSSAI: ${fssai}\n`;
        if (restaurantPhone) billText += `Phone: ${restaurantPhone}\n`;
        billText += `--------------------------\n`;
        billText += `*Order:* ${order.sourceInfo}\n`;
        billText += `*Date:* ${new Date(order.timestamp).toLocaleString()}\n`;
        billText += `--------------------------\n`;
        
        order.items.forEach(item => {
            billText += `${item.name.toUpperCase()} x ${item.quantity} = ₹${((Number(item.offlinePrice || item.onlinePrice) || 0) * item.quantity).toFixed(0)}\n`;
        });
        
        billText += `--------------------------\n`;
        billText += `*Total Payable: ₹${order.total.toFixed(0)}*\n`;
        billText += `--------------------------\n`;
        billText += `Thank you for visiting!`;

        const encodedText = encodeURIComponent(billText);
        const phone = order.deliveryDetails?.phone || '';
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedText}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-fade-in h-full overflow-y-auto no-scrollbar pb-10">
            {showTodaysOrders && <TodaysOrdersModal orders={todaysOrdersProcessed} onClose={() => setShowTodaysOrders(false)} onPrintBill={handlePrintBill} />}
            {showPendingOrdersModal && (
                <PendingOrdersModal 
                    allPendingOrders={pendingOrders} 
                    onClose={() => setShowPendingOrdersModal(false)} 
                    onCompleteOrder={onCompleteOrder} 
                    onInitiateSettle={setSettlingOrder} 
                    onEditOrder={handleStartEdit} 
                    onPrintKOT={handlePrintKOT} 
                    onPrintBill={handlePrintBill}
                    onWhatsAppBill={handleWhatsAppBill}
                />
            )}
            
            {editingOrder && (
                <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-[70] p-4">
                     <div className="bg-gray-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase text-white tracking-tighter italic">Edit Order Items</h3>
                            <button onClick={() => setEditingOrder(null)} className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl hover:bg-lemon hover:text-black transition-all">&times;</button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                            {/* Current Items */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Current Items</h4>
                                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2">
                                    {editedItems.map(item => (
                                        <div key={item.id} className="bg-black/50 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white uppercase truncate">{item.name}</p>
                                                <p className="text-[9px] text-lemon font-bold">₹{item.offlinePrice || item.onlinePrice}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleUpdateEditedItemQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-gray-800 text-white font-black flex items-center justify-center hover:bg-red-600 transition-colors text-xs">-</button>
                                                <span className="text-sm font-black text-lemon min-w-[15px] text-center">{item.quantity}</span>
                                                <button onClick={() => handleUpdateEditedItemQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-gray-800 text-white font-black flex items-center justify-center hover:bg-green-600 transition-colors text-xs">+</button>
                                            </div>
                                        </div>
                                    ))}
                                    {editedItems.length === 0 && (
                                        <p className="text-center py-10 text-gray-700 font-bold uppercase text-[10px]">No items in order</p>
                                    )}
                                </div>
                            </div>

                            {/* Add More Items */}
                            <div className="flex-1 flex flex-col overflow-hidden border-l border-gray-800 pl-6 hidden md:flex">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Add More Items</h4>
                                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pr-2">
                                    {menuItems.map(item => (
                                        <button 
                                            key={item.id} 
                                            onClick={() => handleAddItemToEditedOrder(item)}
                                            className="w-full bg-gray-800/30 hover:bg-gray-800 p-2 rounded-lg text-left border border-gray-800/50 transition-all flex justify-between items-center group"
                                        >
                                            <span className="text-[10px] font-bold text-white uppercase truncate">{item.name}</span>
                                            <span className="text-[9px] text-lemon font-black group-hover:scale-110 transition-transform">+</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800 mt-6">
                            <button 
                                onClick={handleSaveEditedOrder} 
                                className="w-full bg-lemon text-black font-black py-4 rounded-2xl text-sm uppercase shadow-xl shadow-lemon/10 active:scale-95 transition-transform"
                            >
                                Save Changes
                            </button>
                        </div>
                     </div>
                </div>
            )}
            {settlingOrder && <SettleBillModal order={settlingOrder} onClose={() => setSettlingOrder(null)} onSettle={handleSettleAndPrint} />}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                    onClick={() => setShowTodaysOrders(true)}
                    title="Online Sell" 
                    value={`₹${data.onlineSales.toFixed(0)}`} 
                    subtext={`${data.onlineOrders} Orders`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>} 
                />
                <StatCard 
                    onClick={() => setShowTodaysOrders(true)}
                    title="Offline Sell" 
                    value={`₹${data.offlineSales.toFixed(0)}`} 
                    subtext={`${data.offlineOrders} Orders`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>} 
                />
                <StatCard 
                    onClick={() => setShowTodaysOrders(true)}
                    title="Today Sell" 
                    value={`₹${(data.onlineSales + data.offlineSales).toFixed(0)}`} 
                    subtext="Daily Total" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} 
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-lemon/10 p-4 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lemon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-black text-lemon uppercase tracking-tight">PENDING ORDERS</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{pendingOrders.length} Active KOTs</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={handleSendDailyReport} className="flex-1 sm:flex-none bg-gray-800 text-lemon font-black uppercase text-[10px] px-6 py-4 rounded-2xl border border-gray-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Daily Report
                    </button>
                    <button onClick={() => setShowPendingOrdersModal(true)} className="flex-1 sm:flex-none bg-lemon text-black font-black uppercase text-[10px] px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95">
                        View Orders
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <QrOrdersSection orders={incomingQrOrders} onAccept={handleAcceptQrOrder} onPrint={handlePrintKOT} onNavigateToQrMenu={onNavigateToQrMenu} />
            </div>

            <div className="bg-black border border-gray-800 p-5 rounded-2xl mb-10">
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
