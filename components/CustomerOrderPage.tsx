
import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, OrderItem, OrderStatusItem, RegisteredUser, UserStatus } from '../types';

const CustomerOrderPage: React.FC = () => {
    const [restaurant, setRestaurant] = useState<RegisteredUser | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [view, setView] = useState<'menu' | 'cart' | 'checkout' | 'confirmation'>('menu');
    
    // Order Details
    const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default Cash
    const [orderId, setOrderId] = useState('');

    // OTP Simulation State
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
            const sessionKey = params.get('key');
            const encodedData = params.get('data');
            let restaurantData = null;
    
            if (sessionKey) {
                try {
                    const sessionData = sessionStorage.getItem(sessionKey);
                    if (sessionData) {
                        restaurantData = JSON.parse(sessionData);
                    }
                } catch (e) {
                    console.warn("Could not parse data from sessionStorage, falling back.", e);
                }
            }
    
            if (!restaurantData && encodedData) {
                try {
                    // Handle Unicode Decoding properly
                    // The encodedData from params.get() is already URL-decoded (e.g. %3D becomes =)
                    // So we treat it as Base64.
                    const binaryString = atob(encodedData);
                    const jsonString = decodeURIComponent(escape(binaryString));
                    restaurantData = JSON.parse(jsonString);
                } catch (e) {
                    console.error("Failed to parse restaurant data from URL", e);
                    setError("An error occurred while loading the menu. The link may be corrupted or too long.");
                    setLoading(false);
                    return;
                }
            }

            // Expand Minified Data Structure (if present)
            if (restaurantData && restaurantData.m && Array.isArray(restaurantData.m)) {
                try {
                    const expandedMenu = restaurantData.m.map((item: any[]) => ({
                        id: item[0],
                        name: item[1],
                        category: item[2],
                        offlinePrice: Number(item[3]) || 0,
                        onlinePrice: Number(item[4]) || 0,
                        inStock: item[5] === 1
                    }));

                    restaurantData = {
                        id: restaurantData.i,
                        restaurantName: restaurantData.n,
                        address: restaurantData.a || 'Address not available',
                        phone: restaurantData.p || '',
                        fssai: restaurantData.f || '',
                        taxRate: restaurantData.t || 5,
                        deliveryCharge: restaurantData.d || 0,
                        isDeliveryEnabled: restaurantData.e === 1,
                        menu: expandedMenu
                    };
                } catch (e) {
                    console.error("Failed to expand minified data", e);
                }
            }
    
            if (restaurantData && restaurantData.id && restaurantData.restaurantName && Array.isArray(restaurantData.menu)) {
                const sanitizedMenu = restaurantData.menu.map((item: any) => ({
                    ...item,
                    offlinePrice: Number(item.offlinePrice) || 0,
                    onlinePrice: Number(item.onlinePrice) || 0
                }));

                const foundRestaurant: RegisteredUser = {
                    id: restaurantData.id,
                    name: 'Customer View User',
                    phone: restaurantData.phone || '',
                    email: '',
                    password: '',
                    restaurantName: restaurantData.restaurantName,
                    address: restaurantData.address || 'Address not available',
                    taxRate: restaurantData.taxRate || 5, 
                    deliveryCharge: restaurantData.deliveryCharge || 0,
                    isDeliveryEnabled: restaurantData.isDeliveryEnabled !== undefined ? restaurantData.isDeliveryEnabled : true,
                    fssai: restaurantData.fssai || '',
                    menu: sanitizedMenu,
                    status: UserStatus.Approved,
                    lastLogin: '',
                    subscriptionEndDate: '',
                };
                setRestaurant(foundRestaurant);
                setMenu(sanitizedMenu);
                setError(null);
                
                // Update Page Title
                document.title = `${foundRestaurant.restaurantName} - Order Online`;

            } else if (!restaurantData) {
                 setError("Invalid restaurant link. Could not load menu data.");
            } else {
                 setError("Sorry, the restaurant data in the link is invalid.");
            }
            setLoading(false);
        };
    
        loadRestaurantData();

        // Listen for hash changes to reload data if user scans a new QR code without refreshing
        window.addEventListener('hashchange', loadRestaurantData);
        return () => window.removeEventListener('hashchange', loadRestaurantData);
    }, []);


    const addToCart = (item: MenuItem) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            setCart(cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            setCart(cart.filter(item => item.id !== id));
        } else {
            setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
        }
    };
    
    // Logic for Send/Verify OTP
    const handleSendOtp = () => {
        if (!/^\d{10}$/.test(customerPhone)) {
            alert("Please enter a valid 10-digit mobile number first.");
            return;
        }
        const simOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(simOtp);
        setOtpSent(true);
        alert(`Use OTP: ${simOtp} to login/verify.`);
    };

    const handleVerifyOtp = () => {
        if (otp === generatedOtp) {
            setOtpVerified(true);
            alert("Mobile Verified Successfully!");
        } else {
            alert("Invalid OTP. Please try again.");
        }
    };

    // Calculation Logic
    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.onlinePrice * item.quantity, 0); // Use onlinePrice for QR orders
    }, [cart]);
    
    const taxRate = restaurant?.taxRate || 5;
    const tax = cartSubtotal * (taxRate / 100);
    const deliveryFee = (orderType === 'Delivery' && restaurant) ? restaurant.deliveryCharge : 0;
    const cartTotal = cartSubtotal + tax + deliveryFee;


    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant) {
             alert("Cannot place order: Restaurant data not loaded.");
             return;
        }
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        if (!customerName || !otpVerified) {
            alert("Please provide your name and verify your phone number using OTP.");
            return;
        }
        if (orderType === 'Delivery' && !address.trim()) {
            alert("Please provide a delivery address.");
            return;
        }
        
        const displayOrderId = `CUST-${Date.now().toString().slice(-5)}`;
        setOrderId(displayOrderId);
        
        const newOrder: OrderStatusItem = {
            id: Date.now(),
            restaurantId: restaurant.id,
            type: 'Online',
            status: 'Preparation',
            items: cart,
            total: cartTotal,
            sourceInfo: orderType === 'Delivery' ? `Delivery (${customerName})` : `Pickup (${customerName})`,
            timestamp: new Date(),
            deliveryDetails: {
                type: orderType,
                customerName,
                phone: customerPhone,
                address: orderType === 'Delivery' ? address : undefined,
                paymentMethod,
                deliveryCharge: deliveryFee
            }
        };

        try {
            // Use a unique key for each order to prevent race conditions
            const orderKey = `babuSahabPos_incomingOrder_${newOrder.id}`;
            localStorage.setItem(orderKey, JSON.stringify(newOrder));
        } catch (error) {
            console.error("Could not save order to localStorage", error);
            alert("There was an error placing your order. Please try again or contact staff.");
            return;
        }

        setView('confirmation');
    };
    
    const ConfirmationView = () => {
        return (
            <div className="text-center bg-black/80 p-6 md:p-8 rounded-2xl border border-lemon backdrop-blur-md">
                <h2 className="text-3xl font-bold text-lemon mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-300 mb-6">The kitchen has been notified. We will prepare your order shortly.</p>
                
                <div className="bg-gray-900/90 text-left p-4 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex justify-between items-baseline">
                        <p className="text-lg text-gray-400">Order ID:</p>
                        <p className="font-bold text-lg text-white">{orderId}</p>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <p className="text-lg text-gray-400">Type:</p>
                        <p className="font-bold text-lg text-lemon uppercase">{orderType}</p>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <p className="text-lg text-gray-400">Name:</p>
                        <p className="font-bold text-lg text-white">{customerName}</p>
                    </div>
                    {orderType === 'Delivery' && (
                        <div>
                             <p className="text-lg text-gray-400">Delivery Address:</p>
                             <p className="text-sm text-gray-200 mt-1 bg-gray-800 p-2 rounded">{address}</p>
                        </div>
                    )}
                    <hr className="border-gray-600"/>
                    <h4 className="font-semibold text-white pt-2">Order Summary:</h4>
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-gray-300">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{(item.onlinePrice * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr className="border-gray-600"/>
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Tax ({taxRate}%)</span><span>₹{tax.toFixed(2)}</span></div>
                     {orderType === 'Delivery' && <div className="flex justify-between text-gray-400"><span>Delivery Charge</span><span>₹{deliveryFee.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-white font-bold text-xl pt-2">
                        <span>Total ({paymentMethod})</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={() => { 
                        setView('menu'); 
                        setCart([]); 
                        setCustomerName(''); 
                        setCustomerPhone('');
                        setOtpVerified(false);
                        setOtpSent(false);
                        setOtp('');
                        setAddress('');
                        setOrderId('');
                    }} 
                    className="w-full mt-6 bg-lemon text-black font-bold py-3 rounded-lg text-lg"
                >
                    Place Another Order
                </button>
            </div>
        )
    };

    const menuItemsByCategory = useMemo(() => {
        return menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    }, [menu]);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex justify-center items-center">
                <div className="text-center">
                    <p className="text-2xl font-bold text-lemon animate-pulse">Loading Menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-white bg-fixed bg-cover bg-center" style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop')`,
        }}>
            <div className="min-h-screen bg-black/85 backdrop-blur-[2px]">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-black/90 shadow-2xl border-b border-gray-800 backdrop-blur-md">
                    <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                        <h1 className="text-2xl font-extrabold text-lemon drop-shadow-sm">{restaurant?.restaurantName || 'BaBu SAHAB'}</h1>
                        <button onClick={() => setView(view === 'cart' || view === 'checkout' ? 'menu' : 'cart')} className="relative bg-lemon text-black px-4 py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(255,255,0,0.3)] transition-transform active:scale-95">
                            {view === 'cart' || view === 'checkout' ? 'Menu' : 'Cart'}
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-black">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            )}
                        </button>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto p-4 pb-24">
                    {error && (
                        <div className="p-4 bg-red-900/50 text-red-200 border border-red-800 text-center rounded-lg backdrop-blur-sm">{error}</div>
                    )}

                    {!error && restaurant && view === 'menu' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Restaurant Info Card */}
                             <div className="mb-8 p-6 bg-gray-900/80 border border-gray-700 rounded-2xl shadow-xl text-center backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lemon to-transparent"></div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-wide font-serif">{restaurant.restaurantName}</h2>
                                <div className="flex flex-col items-center gap-1 text-gray-300 text-sm md:text-base">
                                    <p>{restaurant.address}</p>
                                    <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-1 text-gray-400">
                                        {restaurant.phone && (
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                {restaurant.phone}
                                            </span>
                                        )}
                                        {restaurant.fssai && (
                                            <span className="flex items-center gap-1 border-l border-gray-600 pl-3 md:pl-6">
                                                <span className="font-bold text-xs bg-gray-700 px-1 rounded">FSSAI</span> {restaurant.fssai}
                                            </span>
                                        )}
                                    </div>
                                </div>
                             </div>

                             {Object.entries(menuItemsByCategory).length > 0 ? Object.entries(menuItemsByCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h2 className="text-2xl font-bold text-lemon capitalize mb-4 border-b border-gray-800 pb-2">{category}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(items as MenuItem[]).filter(item => item.inStock).map(item => (
                                            <div key={item.id} className="bg-gray-900/60 rounded-xl p-4 flex justify-between items-center border border-gray-800 backdrop-blur-sm hover:border-lemon/50 transition-colors shadow-lg">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                                                    <p className="text-gray-400 font-mono">₹{item.onlinePrice.toFixed(2)}</p>
                                                </div>
                                                <button onClick={() => addToCart(item)} className="bg-lemon text-black font-bold px-5 py-2 rounded-lg text-sm hover:bg-lemon-dark hover:scale-105 transition-all shadow-md">ADD</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )) : (
                                <p className="text-center text-gray-500 py-10">The restaurant menu is currently unavailable. Please check back later.</p>
                             )}
                        </div>
                    )}
                    
                    {!error && restaurant && view === 'cart' && (
                        <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-700 backdrop-blur-md shadow-xl animate-fade-in">
                            <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Your Cart</h2>
                            {cart.length === 0 ? <p className="text-gray-500 text-center py-8">Your cart is empty.</p> : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-black/40 rounded-lg p-4 flex justify-between items-center border border-gray-700">
                                            <div>
                                                <h3 className="font-semibold text-white">{item.name}</h3>
                                                <p className="text-lemon">₹{(item.onlinePrice * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-1">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-md hover:bg-gray-700 text-white font-bold">-</button>
                                                <span className="font-mono w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-md hover:bg-gray-700 text-white font-bold">+</button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-700 mt-6 pt-4 space-y-2">
                                        <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-gray-400"><span>Tax ({taxRate}%)</span><span>₹{tax.toFixed(2)}</span></div>
                                        {orderType === 'Delivery' && restaurant && restaurant.isDeliveryEnabled && (
                                            <div className="flex justify-between text-gray-400"><span>Delivery Charge</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                                        )}
                                        <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-gray-700 mt-2"><span>Total</span><span className="text-lemon">₹{cartTotal.toFixed(2)}</span></div>
                                    </div>
                                    <button onClick={() => setView('checkout')} className="w-full mt-6 bg-lemon text-black font-bold py-4 rounded-xl text-lg hover:bg-lemon-dark transition shadow-lg shadow-lemon/20">Proceed to Checkout</button>
                                </div>
                            )}
                        </div>
                    )}

                    {!error && restaurant && view === 'checkout' && (
                        <div className="animate-fade-in">
                            <h2 className="text-3xl font-bold text-white mb-6 text-center">Checkout</h2>
                            
                            <div className="flex bg-gray-900/80 p-1.5 rounded-xl mb-6 border border-gray-700 backdrop-blur-sm">
                                <button 
                                    onClick={() => setOrderType('Pickup')} 
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'Pickup' ? 'bg-lemon text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Self Pickup
                                </button>
                                <button 
                                    onClick={() => setOrderType('Delivery')} 
                                    disabled={!restaurant.isDeliveryEnabled}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'Delivery' ? 'bg-lemon text-black shadow-md' : 'text-gray-400 hover:text-white'} ${!restaurant.isDeliveryEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {restaurant.isDeliveryEnabled ? 'Home Delivery' : 'Not Available'}
                                </button>
                            </div>

                            <form onSubmit={handlePlaceOrder} className="space-y-4 bg-gray-900/80 p-6 rounded-2xl border border-gray-700 backdrop-blur-md shadow-xl">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1 font-bold ml-1">Your Name</label>
                                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter Full Name" required className="w-full bg-black/40 text-white p-3.5 rounded-xl border border-gray-600 focus:border-lemon focus:ring-1 focus:ring-lemon outline-none transition-all"/>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1 font-bold ml-1">Mobile Number</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="tel" 
                                                value={customerPhone} 
                                                onChange={e => setCustomerPhone(e.target.value)} 
                                                placeholder="10-digit Number" 
                                                maxLength={10}
                                                required 
                                                disabled={otpVerified}
                                                className="flex-grow bg-black/40 text-white p-3.5 rounded-xl border border-gray-600 focus:border-lemon focus:ring-1 focus:ring-lemon outline-none disabled:opacity-50"
                                            />
                                            {!otpVerified && (
                                                <button type="button" onClick={handleSendOtp} className="bg-gray-700 text-white font-bold px-4 rounded-xl hover:bg-gray-600 whitespace-nowrap border border-gray-600">
                                                    {otpSent ? 'Resend' : 'Send OTP'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {otpSent && !otpVerified && (
                                        <div className="flex gap-2 animate-fade-in">
                                            <input 
                                                type="text" 
                                                value={otp} 
                                                onChange={e => setOtp(e.target.value)} 
                                                placeholder="Enter 4-digit OTP" 
                                                maxLength={4}
                                                className="flex-grow bg-black/40 text-white p-3.5 rounded-xl border border-gray-600 focus:border-lemon focus:ring-1 focus:ring-lemon outline-none"
                                            />
                                            <button type="button" onClick={handleVerifyOtp} className="bg-green-600 text-white font-bold px-6 rounded-xl hover:bg-green-700 shadow-lg shadow-green-900/20">
                                                Verify
                                            </button>
                                        </div>
                                    )}
                                    
                                    {otpVerified && (
                                        <div className="bg-green-900/30 text-green-400 text-sm font-bold p-3 rounded-lg border border-green-800/50 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Mobile Verified
                                        </div>
                                    )}

                                    {orderType === 'Delivery' && (
                                        <div className="animate-fade-in">
                                            <label className="text-sm text-gray-400 block mb-1 font-bold ml-1">Delivery Address</label>
                                            <textarea 
                                                value={address} 
                                                onChange={e => setAddress(e.target.value)} 
                                                placeholder="Complete Address (House No, Street, Landmark, Pincode)" 
                                                rows={3}
                                                required 
                                                className="w-full bg-black/40 text-white p-3.5 rounded-xl border border-gray-600 focus:border-lemon focus:ring-1 focus:ring-lemon outline-none resize-none"
                                            />
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <label className="text-sm text-gray-400 block mb-2 font-bold ml-1">Payment Method</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Cash', 'UPI', 'Card'].map(method => (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(method)}
                                                    className={`py-3 rounded-xl border font-semibold transition-all ${paymentMethod === method ? 'bg-lemon text-black border-lemon shadow-md' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 mt-4 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-400"><span>Tax ({taxRate}%)</span><span>₹{tax.toFixed(2)}</span></div>
                                    {orderType === 'Delivery' && <div className="flex justify-between text-gray-400"><span>Delivery Charge</span><span>₹{deliveryFee.toFixed(2)}</span></div>}
                                    <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-gray-700"><span>Total</span><span className="text-lemon">₹{cartTotal.toFixed(2)}</span></div>
                                </div>
                                
                                <button type="submit" disabled={!otpVerified} className="w-full mt-4 bg-lemon text-black font-bold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lemon-dark transition shadow-lg shadow-lemon/20">
                                    {otpVerified ? 'Place Order' : 'Verify Mobile First'}
                                </button>
                            </form>
                        </div>
                    )}

                    {!error && restaurant && view === 'confirmation' && <ConfirmationView />}
                </main>
            </div>
        </div>
    );
};

export default CustomerOrderPage;
