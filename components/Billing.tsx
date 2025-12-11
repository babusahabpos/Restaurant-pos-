
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, OrderStatusItem } from '../types';

interface BillingProps {
    onPrintKOT: (order: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'>) => void;
    menuItems: MenuItem[];
    taxRate: number;
    restaurantName: string;
    isPrinterEnabled: boolean;
}

const Billing: React.FC<BillingProps> = ({ onPrintKOT, menuItems = [], taxRate, restaurantName, isPrinterEnabled }) => {
    // Safety check: Filter out null/undefined items and ensure required properties exist
    const validMenuItems = useMemo(() => (menuItems || []).filter(item => item && item.name && item.category), [menuItems]);
    
    const categories = useMemo(() => ['All', ...new Set(validMenuItems.map(item => item.category))], [validMenuItems]);
    
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    const [orderSource, setOrderSource] = useState<'Takeaway' | 'Dine-in'>('Takeaway');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState<number>(0);

    const filteredMenuItems = validMenuItems.filter(item => 
        item.inStock &&
        (activeCategory === 'All' || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToOrder = (item: MenuItem) => {
        const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
        if (existingItem) {
            updateQuantity(item.id, existingItem.quantity + 1);
        } else {
            setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromOrder(id);
        } else {
            setCurrentOrder(currentOrder.map(item => item.id === id ? { ...item, quantity } : item));
        }
    };

    const removeFromOrder = (id: number) => {
        setCurrentOrder(currentOrder.filter(item => item.id !== id));
    };
    
    const resetOrder = () => {
        if (window.confirm('Are you sure you want to reset the current order?')) {
            setCurrentOrder([]);
            setOrderSource('Takeaway');
            setTableNumber('');
            setCustomerName('');
            setCustomerPhone('');
            setDiscount(0);
        }
    };

    const createKOTPrintContent = (orderToPrint: {sourceInfo: string, customerName?: string, customerPhone?: string, items: OrderItem[]}) => {
        return `
            <style>
                body { font-family: 'Courier New', monospace; font-size: 10pt; width: 80mm; margin: 0; padding: 5px; }
                h3, p { text-align: center; margin: 2px 0; }
                hr { border: none; border-top: 1px dashed black; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { padding: 2px; }
                .items th, .items td { border-bottom: 1px dashed #ccc; }
                .items th:first-child, .items td:first-child { text-align: left; }
                .items th:last-child, .items td:last-child { text-align: center; }
            </style>
            <h3>${restaurantName}</h3>
            <h3>Kitchen Order Ticket</h3>
            <p>Date: ${new Date().toLocaleString()}</p>
            <p>Order: ${orderToPrint.sourceInfo}</p>
            ${orderToPrint.customerName ? `<p>Customer: ${orderToPrint.customerName} (${orderToPrint.customerPhone || 'N/A'})</p>` : ''}
            <hr>
            <table class="items">
                <thead><tr><th>Item</th><th>Qty</th></tr></thead>
                <tbody>
                    ${orderToPrint.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    };

    const triggerPrint = (content: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print</title></head><body>' + content + '</body></html>');
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
    
    const handleShareWhatsApp = () => {
         if (!customerPhone || !/^\d{10}$/.test(customerPhone)) {
            alert("Please enter a valid 10-digit customer phone number to share bill.");
            return;
        }

        const subtotal = currentOrder.reduce((acc, item) => acc + (Number(item.offlinePrice) || 0) * item.quantity, 0);
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax - discount;

        let message = `*Bill from ${restaurantName}*\n\n`;
        message += `Date: ${new Date().toLocaleDateString()}\n`;
        message += `------------------------\n`;
        currentOrder.forEach(item => {
            message += `${item.name} x ${item.quantity}: ₹${((Number(item.offlinePrice) || 0) * item.quantity).toFixed(2)}\n`;
        });
        message += `------------------------\n`;
        message += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
        message += `Tax (${taxRate}%): ₹${tax.toFixed(2)}\n`;
        if(discount > 0) message += `Discount: -₹${discount.toFixed(2)}\n`;
        message += `*Total: ₹${Math.max(0, total).toFixed(2)}*\n\n`;
        message += `Thank you for dining with us!`;

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/91${customerPhone}?text=${encodedMessage}`;
        window.open(url, '_blank');
    };

    const handleSendToKitchen = () => {
        if (currentOrder.length === 0) {
            alert('Cannot send an empty order to the kitchen.');
            return;
        }
        if (orderSource === 'Dine-in' && !tableNumber.trim()) {
            alert('Please enter a table number for Dine-in orders.');
            return;
        }

        const newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'> = {
            type: 'Offline',
            items: currentOrder,
            total,
            discount,
            sourceInfo: orderSource === 'Dine-in' ? `Table: ${tableNumber}` : `Takeaway (${customerName || 'N/A'})`
        };
        onPrintKOT(newOrderData);
        
        if (isPrinterEnabled) {
            const kotContent = createKOTPrintContent({
                sourceInfo: newOrderData.sourceInfo,
                customerName: customerName,
                customerPhone: customerPhone,
                items: currentOrder
            });
            triggerPrint(kotContent);
        }

        alert('Order sent to kitchen!');
        setCurrentOrder([]);
        setOrderSource('Takeaway');
        setTableNumber('');
        setCustomerName('');
        setCustomerPhone('');
        setDiscount(0);
    };

    const subtotal = currentOrder.reduce((acc, item) => acc + (Number(item.offlinePrice) || 0) * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Menu Selection */}
            <div className="lg:w-3/5 bg-black p-6 rounded-lg border border-gray-800 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">Menu</h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input 
                        type="text" 
                        placeholder="Search all menu items..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow bg-gray-900 text-white placeholder-gray-400 p-2.5 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
                    />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeCategory === category ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow overflow-y-auto pr-2">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-gray-900 p-3 rounded-lg text-left cursor-pointer hover:border-lemon transition border border-gray-800 flex flex-col justify-between h-28">
                           <p className="text-white font-semibold leading-tight">{item.name}</p>
                           <p className="text-gray-400 text-sm mt-2">₹{(Number(item.offlinePrice) || 0).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Order */}
            <div className="bg-black p-6 rounded-lg border border-gray-800 lg:w-2/5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Current Order</h3>
                </div>

                <div className="flex gap-2 mb-4">
                    <button onClick={() => setOrderSource('Takeaway')} className={`flex-1 text-sm font-bold py-2 rounded-lg ${orderSource === 'Takeaway' ? 'bg-lemon text-black' : 'bg-gray-800 text-white'}`}>Takeaway</button>
                    <button onClick={() => setOrderSource('Dine-in')} className={`flex-1 text-sm font-bold py-2 rounded-lg ${orderSource === 'Dine-in' ? 'bg-lemon text-black' : 'bg-gray-800 text-white'}`}>Dine-in</button>
                </div>

                {orderSource === 'Dine-in' ? (
                    <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Table Number" className="w-full bg-gray-900 text-white p-2 mb-4 rounded-lg border border-gray-800" />
                ) : (
                    <div className="flex gap-4 mb-4">
                         <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name" className="w-1/2 bg-gray-900 text-white p-2 rounded-lg border border-gray-800" />
                         <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Customer Phone" className="w-1/2 bg-gray-900 text-white p-2 rounded-lg border border-gray-800" />
                    </div>
                )}
                
                <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                    {currentOrder.length === 0 && <p className="text-gray-500 text-center py-10">No items in order.</p>}
                    {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <p className="text-white flex-grow">{item.name}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 rounded bg-gray-800 text-white">-</button>
                                <span className="text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 rounded bg-gray-800 text-white">+</button>
                            </div>
                            <p className="text-white w-20 text-right">₹{((Number(item.offlinePrice) || 0) * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromOrder(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 mt-auto pt-4 space-y-2">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Tax ({taxRate}%)</span><span>₹{tax.toFixed(2)}</span></div>
                    
                    {/* Discount Input */}
                    <div className="flex justify-between items-center text-gray-400">
                        <span>Discount (₹)</span>
                        <input 
                            type="number" 
                            value={discount} 
                            onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))} 
                            className="w-24 bg-gray-900 text-white p-1 text-right rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-lemon" 
                        />
                    </div>

                    <div className="flex justify-between text-white font-bold text-lg"><span>Total</span><span>₹{Math.max(0, total).toFixed(2)}</span></div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                     {/* WhatsApp Share Button */}
                     {currentOrder.length > 0 && customerPhone && (
                        <button 
                            onClick={handleShareWhatsApp}
                            className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            Share Bill on WhatsApp
                        </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={resetOrder} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700">Reset Order</button>
                        <button 
                            onClick={handleSendToKitchen} 
                            className="flex-1 bg-lemon text-black font-bold py-3 rounded-lg hover:bg-lemon-dark disabled:bg-lemon/50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            disabled={currentOrder.length === 0 || (orderSource === 'Dine-in' && !tableNumber.trim())}
                        >
                            {isPrinterEnabled ? 'Print KOT & Send' : 'Save Order (No Print)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;