
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

        try {
            const syncKey = `${restaurant.id}_${restaurant.phone}`;
            const getRes = await fetch(`${CLOUD_SYNC_URL}${syncKey}`);
            let currentQueue = [];
            if (getRes.ok) currentQueue = await getRes.json();
            if (!Array.isArray(currentQueue)) currentQueue = [];
            
            currentQueue.push(newOrder);
            await fetch(`${CLOUD_SYNC_URL}${syncKey}`, {
                method: 'PUT',
                body: JSON.stringify(currentQueue),
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.warn("Cloud push failed, falling back to local only.");
        }

        localStorage.setItem(`babuSahabPos_incomingOrder_${newOrder.id}`, JSON.stringify(newOrder));
        setView('confirmation');
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex justify-center items-center"><p className="text-xl font-bold text-lemon animate-pulse">Opening Menu...</p></div>;

    return (
        <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
            <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-black shrink-0 z-10 shadow-lg">
                <h1 className="text-xl font-black text-lemon uppercase truncate max-w-[60%]">{restaurant?.restaurantName}</h1>
                <button onClick={() => setView(view === 'menu' ? 'cart' : 'menu')} className="bg-lemon text-black font-black px-4 py-2 rounded-xl text-[10px] uppercase relative active:scale-95 transition-transform">
                    {view === 'menu' ? 'Cart' : 'Back'}
                    {cart.length > 0 && view === 'menu' && <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-black">{cart.length}</span>}
                </button>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 w-full max-w-2xl mx-auto pb-24">
                {error && <div className="bg-red-900/20 text-red-400 p-6 rounded-3xl border border-red-800 text-center uppercase text-xs font-black animate-fade-in">{error}</div>}
                
                {view === 'menu' && !error && (
                    <div className="space-y-8 animate-fade-in">
                        {Object.entries(menu.reduce<Record<string, MenuItem[]>>((acc, i) => { if(!acc[i.category]) acc[i.category]=[]; acc[i.category].push(i); return acc; }, {})).map(([cat, items]) => (
                            <div key={cat} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">{cat}</h2>
                                    <div className="h-px bg-gray-800 flex-1"></div>
                                </div>
                                <div className="space-y-3">
                                    {(items as MenuItem[]).filter(i => i.inStock).map(i => (
                                        <div key={i.id} className="bg-gray-900 border border-gray-800 p-5 rounded-[1.8rem] flex justify-between items-center hover:border-lemon/20 transition-all active:scale-[0.98]">
                                            <div className="flex-1 pr-4">
                                                <p className="font-black text-white uppercase text-sm tracking-tight">{i.name}</p>
                                                <p className="text-lemon font-black text-base mt-1 tracking-tighter">₹{i.onlinePrice}</p>
                                            </div>
                                            <button 
                                                onClick={() => addToCart(i)} 
                                                className="bg-gray-800 text-lemon font-black px-6 py-2.5 rounded-2xl text-[10px] uppercase border border-lemon/10 shadow-lg active:bg-lemon active:text-black transition-all"
                                            >
                                                ADD
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'cart' && (
                    <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 animate-fade-in shadow-2xl">
                        <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tighter italic">Review Order</h2>
                        {cart.length === 0 ? (
                            <div className="text-center py-20 opacity-20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                                <p className="font-black uppercase text-xs tracking-widest">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {cart.map(i => (
                                        <div key={i.id} className="flex justify-between items-center border-b border-white/5 pb-4">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-sm font-black uppercase text-white truncate">{i.name}</p>
                                                <p className="text-lemon font-bold text-xs">₹{i.onlinePrice * i.quantity}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-black p-1.5 rounded-2xl border border-gray-800">
                                                <button onClick={() => updateQuantity(i.id, i.quantity - 1)} className="w-8 h-8 rounded-xl hover:bg-gray-800 transition-colors text-white font-black">-</button>
                                                <span className="text-sm font-black text-lemon min-w-[20px] text-center">{i.quantity}</span>
                                                <button onClick={() => updateQuantity(i.id, i.quantity + 1)} className="w-8 h-8 rounded-xl hover:bg-gray-800 transition-colors text-white font-black">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 space-y-3 bg-black/30 p-6 rounded-3xl border border-white/5">
                                    <div className="flex justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
                                    {deliveryFee > 0 && <div className="flex justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest"><span>Delivery Charge</span><span>₹{deliveryFee}</span></div>}
                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                        <span className="text-sm text-white font-black uppercase">Grand Total</span>
                                        <span className="text-2xl text-lemon font-black tracking-tighter">₹{cartTotal.toFixed(0)}</span>
                                    </div>
                                </div>
                                <button onClick={() => setView('checkout')} className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase text-xs tracking-widest mt-6 shadow-xl shadow-lemon/10 active:scale-95 transition-all">Proceed to Details</button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'checkout' && (
                    <form onSubmit={handlePlaceOrder} className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-6 animate-fade-in shadow-2xl">
                        <div className="flex gap-2 p-1.5 bg-black rounded-2xl border border-gray-800">
                             <button type="button" onClick={() => setOrderType('Pickup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'Pickup' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500'}`}>Self Pickup</button>
                             <button type="button" onClick={() => setOrderType('Delivery')} disabled={!restaurant?.isDeliveryEnabled} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'Delivery' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 disabled:opacity-20'}`}>Home Delivery</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                <input placeholder="Your Name" className="w-full bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none font-bold focus:border-lemon transition-colors" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                            </div>
                            
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Verification Required</label>
                                <div className="flex gap-2">
                                    <input placeholder="Mobile Number" type="tel" maxLength={10} className="flex-1 bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none font-bold focus:border-lemon" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={otpVerified} required />
                                    {!otpVerified && <button type="button" onClick={handleSendOtp} className="bg-gray-800 text-lemon px-6 rounded-2xl font-black text-[10px] uppercase border border-lemon/20 active:scale-95 transition-all">{otpSent ? 'Resend' : 'Send OTP'}</button>}
                                </div>
                            </div>
                            
                            {otpSent && !otpVerified && (
                                <div className="flex gap-2 animate-bounce-short">
                                    <input placeholder="4-digit Code" className="flex-1 bg-black text-lemon p-4 rounded-2xl border border-lemon/30 outline-none font-black text-center tracking-[0.5em]" value={otp} onChange={e => setOtp(e.target.value)} />
                                    <button type="button" onClick={handleVerifyOtp} className="bg-lemon text-black px-8 rounded-2xl font-black text-[10px] uppercase active:scale-95">Verify</button>
                                </div>
                            )}

                            {orderType === 'Delivery' && (
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Drop Location</label>
                                    <textarea placeholder="Your Complete Address" className="w-full bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none font-bold focus:border-lemon resize-none" rows={3} value={address} onChange={e => setAddress(e.target.value)} required />
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={!otpVerified} className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase text-xs tracking-[0.2em] shadow-2xl shadow-lemon/10 disabled:opacity-20 active:scale-95 transition-all mt-4">Place Order • ₹{cartTotal.toFixed(0)}</button>
                    </form>
                )}

                {view === 'confirmation' && (
                    <div className="bg-gray-900 p-10 rounded-[3rem] border border-lemon text-center space-y-8 animate-fade-in shadow-2xl">
                        <div className="w-24 h-24 bg-lemon/10 rounded-full mx-auto flex items-center justify-center text-lemon border border-lemon/20">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">ORDER PLACED!</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Notification sent to kitchen</p>
                        </div>
                        <div className="bg-black/50 p-6 rounded-3xl border border-white/5">
                             <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Your Order ID</p>
                             <p className="text-3xl font-black text-lemon tracking-tighter">{orderId}</p>
                        </div>
                        <button onClick={() => window.location.reload()} className="w-full bg-white text-black font-black py-5 rounded-[1.5rem] uppercase text-[11px] tracking-[0.2em] shadow-xl active:scale-95 transition-all">Order More Items</button>
                    </div>
                )}
            </main>
            
            {/* Simple Footer Logo */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-gray-900 flex justify-center items-center pointer-events-none">
                 <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Powered by BaBu SAHAB POS</p>
            </div>
        </div>
    );
};

export default CustomerOrderPage;
