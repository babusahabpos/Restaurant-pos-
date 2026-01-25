
import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, OrderItem, OrderStatusItem, RegisteredUser, UserStatus } from '../types';

const CLOUD_SYNC_URL = "https://kvdb.io/59m7f7eK6Z6F6X9u6G6G6/orders_";

const CustomerOrderPage: React.FC = () => {
    const [restaurant, setRestaurant] = useState<RegisteredUser | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [view, setView] = useState<'menu' | 'cart' | 'checkout' | 'confirmation'>('menu');
    
    const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash'); 
    const [orderId, setOrderId] = useState('');

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);

    useEffect(() => {
        const loadRestaurantData = () => {
            setLoading(true);
            const hash = window.location.hash;
            if (!hash.includes('?')) {
                setError("No restaurant specified in the link.");
                setLoading(false);
                return;
            }
    
            const params = new URLSearchParams(hash.split('?')[1]);
            const encodedData = params.get('data');
            let restaurantData = null;
    
            if (encodedData) {
                try {
                    const binaryString = atob(encodedData);
                    const jsonString = decodeURIComponent(escape(binaryString));
                    restaurantData = JSON.parse(jsonString);
                } catch (e) {
                    setError("Link error. Please scan QR again.");
                    setLoading(false);
                    return;
                }
            }

            if (restaurantData && restaurantData.m && Array.isArray(restaurantData.m)) {
                try {
                    const expandedMenu = restaurantData.m.map((item: any[]) => ({
                        id: item[0], name: item[1], category: item[2],
                        offlinePrice: Number(item[3]) || 0, onlinePrice: Number(item[4]) || 0, inStock: item[5] === 1
                    }));

                    restaurantData = {
                        id: restaurantData.i, restaurantName: restaurantData.n, address: restaurantData.a || 'N/A',
                        phone: restaurantData.p || '', fssai: restaurantData.f || '', taxRate: restaurantData.t || 5,
                        deliveryCharge: restaurantData.d || 0, isDeliveryEnabled: restaurantData.e === 1, menu: expandedMenu
                    };
                } catch (e) {}
            }
    
            if (restaurantData && restaurantData.id && restaurantData.restaurantName && Array.isArray(restaurantData.menu)) {
                const foundRestaurant: RegisteredUser = {
                    id: restaurantData.id, name: 'Guest', phone: restaurantData.phone || '',
                    email: '', password: '', restaurantName: restaurantData.restaurantName,
                    address: restaurantData.address || 'N/A', taxRate: restaurantData.taxRate || 5, 
                    deliveryCharge: restaurantData.deliveryCharge || 0, isDeliveryEnabled: restaurantData.isDeliveryEnabled !== undefined ? restaurantData.isDeliveryEnabled : true,
                    fssai: restaurantData.fssai || '', menu: restaurantData.menu, status: UserStatus.Approved, lastLogin: '', subscriptionEndDate: '',
                };
                setRestaurant(foundRestaurant);
                setMenu(restaurantData.menu);
                setError(null);
                document.title = `${foundRestaurant.restaurantName} - Order Online`;
            } else {
                 setError("Invalid restaurant link.");
            }
            setLoading(false);
        };
    
        loadRestaurantData();
        window.addEventListener('hashchange', loadRestaurantData);
        return () => window.removeEventListener('hashchange', loadRestaurantData);
    }, []);

    const addToCart = (item: MenuItem) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        else setCart([...cart, { ...item, quantity: 1 }]);
    };

    const updateQuantity = (id: number, qty: number) => {
        if (qty < 1) setCart(cart.filter(c => c.id !== id));
        else setCart(cart.map(c => c.id === id ? { ...c, quantity: qty } : c));
    };
    
    const handleSendOtp = () => {
        if (!/^\d{10}$/.test(customerPhone)) { alert("Enter valid mobile."); return; }
        const simOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(simOtp); setOtpSent(true);
        alert(`Use OTP: ${simOtp}`);
    };

    const handleVerifyOtp = () => {
        if (otp === generatedOtp) { setOtpVerified(true); alert("Verified!"); }
        else alert("Invalid OTP.");
    };

    const cartSubtotal = useMemo(() => cart.reduce((t, i) => t + i.onlinePrice * i.quantity, 0), [cart]);
    const tax = cartSubtotal * ((restaurant?.taxRate || 5) / 100);
    const deliveryFee = (orderType === 'Delivery' && restaurant) ? restaurant.deliveryCharge : 0;
    const cartTotal = cartSubtotal + tax + deliveryFee;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant || cart.length === 0 || !customerName || !otpVerified) {
            alert("Check form and verification.");
            return;
        }
        
        const displayId = `QR-${Date.now().toString().slice(-4)}`;
        setOrderId(displayId);
        
        const newOrder: OrderStatusItem = {
            id: Date.now(), restaurantId: restaurant.id, type: 'Online', status: 'Placed',
            items: cart, total: cartTotal, sourceInfo: `${orderType} (${customerName})`, timestamp: new Date(),
            deliveryDetails: { type: orderType, customerName, phone: customerPhone, address: orderType === 'Delivery' ? address : undefined, paymentMethod, deliveryCharge: deliveryFee }
        };

        // --- CLOUD SYNC PUSH ---
        // Pushes the order to the public cloud relay for the owner to fetch
        try {
            const syncKey = `${restaurant.id}_${restaurant.phone}`;
            // 1. Fetch current cloud queue
            const getRes = await fetch(`${CLOUD_SYNC_URL}${syncKey}`);
            let currentQueue = [];
            if (getRes.ok) currentQueue = await getRes.json();
            if (!Array.isArray(currentQueue)) currentQueue = [];
            
            // 2. Add new order and update cloud
            currentQueue.push(newOrder);
            await fetch(`${CLOUD_SYNC_URL}${syncKey}`, {
                method: 'PUT',
                body: JSON.stringify(currentQueue),
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.warn("Cloud push failed, falling back to local only.");
        }

        // Also save locally for good measure
        localStorage.setItem(`babuSahabPos_incomingOrder_${newOrder.id}`, JSON.stringify(newOrder));
        setView('confirmation');
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex justify-center items-center"><p className="text-xl font-bold text-lemon animate-pulse">Opening Menu...</p></div>;

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-xl font-black text-lemon uppercase">{restaurant?.restaurantName}</h1>
                <button onClick={() => setView(view === 'menu' ? 'cart' : 'menu')} className="bg-lemon text-black font-black px-4 py-2 rounded-lg text-xs uppercase relative">
                    {view === 'menu' ? 'My Cart' : 'Menu'}
                    {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{cart.length}</span>}
                </button>
            </header>

            <main className="max-w-2xl mx-auto">
                {error && <div className="bg-red-900/20 text-red-400 p-4 rounded-xl border border-red-800 text-center uppercase text-xs font-black">{error}</div>}
                
                {view === 'menu' && !error && (
                    <div className="space-y-6">
                        {/* Fix: Added explicit casting to MenuItem[] to fix Property 'filter' does not exist on type 'unknown' error */}
                        {Object.entries(menu.reduce<Record<string, MenuItem[]>>((acc, i) => { if(!acc[i.category]) acc[i.category]=[]; acc[i.category].push(i); return acc; }, {})).map(([cat, items]) => (
                            <div key={cat}>
                                <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">{cat}</h2>
                                <div className="space-y-2">
                                    {(items as MenuItem[]).filter(i => i.inStock).map(i => (
                                        <div key={i.id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                                            <div><p className="font-bold text-white uppercase text-sm">{i.name}</p><p className="text-lemon font-black text-xs mt-1">₹{i.onlinePrice}</p></div>
                                            <button onClick={() => addToCart(i)} className="bg-gray-800 text-lemon font-black px-4 py-2 rounded-xl text-[10px] border border-lemon/20 active:bg-lemon active:text-black">ADD</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'cart' && (
                    <div className="bg-gray-900 p-6 rounded-[2rem] border border-gray-800 animate-fade-in">
                        <h2 className="text-xl font-black text-white uppercase mb-6">Review Cart</h2>
                        {cart.length === 0 ? <p className="text-gray-500 text-center py-10">Cart is empty</p> : (
                            <div className="space-y-4">
                                {cart.map(i => (
                                    <div key={i.id} className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <div className="flex-1"><p className="text-sm font-bold uppercase">{i.name}</p><p className="text-lemon text-xs">₹{i.onlinePrice * i.quantity}</p></div>
                                        <div className="flex items-center gap-3 bg-black p-1 rounded-lg">
                                            <button onClick={() => updateQuantity(i.id, i.quantity - 1)} className="w-8 h-8 text-white">-</button>
                                            <span className="text-xs font-black">{i.quantity}</span>
                                            <button onClick={() => updateQuantity(i.id, i.quantity + 1)} className="w-8 h-8 text-white">+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500 font-bold uppercase"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
                                    <div className="flex justify-between text-sm text-white font-black uppercase"><span>Grand Total</span><span className="text-lemon text-lg">₹{cartTotal.toFixed(0)}</span></div>
                                </div>
                                <button onClick={() => setView('checkout')} className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-xs mt-6">Checkout</button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'checkout' && (
                    <form onSubmit={handlePlaceOrder} className="bg-gray-900 p-6 rounded-[2rem] border border-gray-800 space-y-4">
                        <div className="flex gap-2 p-1 bg-black rounded-xl border border-gray-800">
                             <button type="button" onClick={() => setOrderType('Pickup')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${orderType === 'Pickup' ? 'bg-lemon text-black' : 'text-gray-500'}`}>Pickup</button>
                             <button type="button" onClick={() => setOrderType('Delivery')} disabled={!restaurant?.isDeliveryEnabled} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${orderType === 'Delivery' ? 'bg-lemon text-black' : 'text-gray-500'}`}>Delivery</button>
                        </div>
                        <input placeholder="Your Name" className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 outline-none font-bold" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                        <div className="flex gap-2">
                            <input placeholder="Mobile Number" type="tel" maxLength={10} className="flex-1 bg-black text-white p-4 rounded-xl border border-gray-800 outline-none font-bold" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={otpVerified} required />
                            {!otpVerified && <button type="button" onClick={handleSendOtp} className="bg-gray-800 text-lemon px-4 rounded-xl font-black text-[9px] uppercase border border-lemon/20">{otpSent ? 'Retry' : 'Verify'}</button>}
                        </div>
                        {otpSent && !otpVerified && (
                            <div className="flex gap-2">
                                <input placeholder="4-digit OTP" className="flex-1 bg-black text-white p-4 rounded-xl border border-lemon/30 outline-none font-bold" value={otp} onChange={e => setOtp(e.target.value)} />
                                <button type="button" onClick={handleVerifyOtp} className="bg-lemon text-black px-6 rounded-xl font-black text-[9px] uppercase">Verify</button>
                            </div>
                        )}
                        {orderType === 'Delivery' && <textarea placeholder="Address" className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 outline-none font-bold" rows={2} value={address} onChange={e => setAddress(e.target.value)} required />}
                        <button type="submit" disabled={!otpVerified} className="w-full bg-lemon text-black font-black py-4 rounded-xl uppercase text-xs shadow-xl shadow-lemon/20 disabled:opacity-30">Place Order - ₹{cartTotal.toFixed(0)}</button>
                    </form>
                )}

                {view === 'confirmation' && (
                    <div className="bg-gray-900 p-8 rounded-[3rem] border border-lemon text-center space-y-6">
                        <div className="w-20 h-20 bg-lemon/10 rounded-full mx-auto flex items-center justify-center text-lemon">
                             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Order Placed!</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-loose">We have notified the kitchen. Your Order ID is <span className="text-lemon">{orderId}</span></p>
                        <button onClick={() => window.location.reload()} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-[10px] tracking-widest">Back to Menu</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerOrderPage;
