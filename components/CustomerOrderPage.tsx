import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, OrderItem, OrderStatusItem, RegisteredUser, UserStatus } from '../types';

const CustomerOrderPage: React.FC = () => {
    const [restaurant, setRestaurant] = useState<RegisteredUser | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [view, setView] = useState<'menu' | 'cart' | 'checkout' | 'confirmation'>('menu');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderId, setOrderId] = useState('');

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
    
            // Priority 1: Try reading from sessionStorage using the key
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
    
            // Priority 2: Fallback to reading from the 'data' URL parameter
            if (!restaurantData && encodedData) {
                try {
                    const decodedData = atob(decodeURIComponent(encodedData));
                    restaurantData = JSON.parse(decodedData);
                } catch (e) {
                    console.error("Failed to parse restaurant data from URL", e);
                    setError("An error occurred while loading the menu. The link may be corrupted or too long.");
                    setLoading(false);
                    return;
                }
            }
    
            // Final check and state update
            if (restaurantData && restaurantData.id && restaurantData.restaurantName && Array.isArray(restaurantData.menu)) {
                const foundRestaurant: RegisteredUser = {
                    id: restaurantData.id,
                    name: 'Customer View User',
                    phone: '',
                    email: '',
                    password: '',
                    restaurantName: restaurantData.restaurantName,
                    address: restaurantData.address || 'Address not available',
                    menu: restaurantData.menu,
                    status: UserStatus.Approved,
                    lastLogin: '',
                    subscriptionEndDate: '',
                };
                setRestaurant(foundRestaurant);
                setMenu(foundRestaurant.menu);
                setError(null); // Clear any previous errors
            } else if (!restaurantData) {
                 setError("Invalid restaurant link. Could not load menu data.");
            } else {
                 setError("Sorry, the restaurant data in the link is invalid.");
            }
            setLoading(false);
        };
    
        loadRestaurantData();
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
    
    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.offlinePrice * item.quantity, 0);
    }, [cart]);
    const tax = cartSubtotal * 0.05;
    const cartTotal = cartSubtotal + tax;


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
        if (!customerName || !/^\d{10}$/.test(customerPhone)) {
            alert("Please enter your name and a valid 10-digit mobile number.");
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
            sourceInfo: `Customer: ${customerName} (${customerPhone})`,
            timestamp: new Date()
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
            <div className="text-center bg-gray-900 p-6 md:p-8 rounded-lg border border-lemon">
                <h2 className="text-3xl font-bold text-lemon mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-300 mb-6">The kitchen has been notified. We will prepare your order shortly.</p>
                
                <div className="bg-black text-left p-4 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex justify-between items-baseline">
                        <p className="text-lg text-gray-400">Order ID:</p>
                        <p className="font-bold text-lg text-white">{orderId}</p>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <p className="text-lg text-gray-400">Name:</p>
                        <p className="font-bold text-lg text-white">{customerName}</p>
                    </div>
                    <hr className="border-gray-600"/>
                    <h4 className="font-semibold text-white pt-2">Order Summary:</h4>
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-gray-300">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{(item.offlinePrice * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <hr className="border-gray-600"/>
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Taxes (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-white font-bold text-xl pt-2">
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={() => { 
                        setView('menu'); 
                        setCart([]); 
                        setCustomerName(''); 
                        setCustomerPhone('');
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
        // FIX: The initial value for `reduce` must be explicitly typed. Without this, TypeScript infers the accumulator (`acc`)
        // as `{}`, which leads to the `items` variable in the component's render function being of type `unknown`.
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
                    <p className="text-2xl font-bold text-lemon">Loading Menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <header className="bg-gray-900 sticky top-0 z-10 p-4 shadow-lg border-b border-gray-800">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-lemon">{restaurant?.restaurantName || 'BaBu SAHAB'}</h1>
                    <button onClick={() => setView(view === 'cart' || view === 'checkout' ? 'menu' : 'cart')} className="relative bg-lemon text-black px-4 py-2 rounded-lg font-bold">
                        {view === 'cart' || view === 'checkout' ? 'Menu' : 'Cart'}
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-black text-lemon rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        )}
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 pb-20">
                 {error && (
                    <div className="p-4 bg-lemon/20 text-lemon text-center rounded-lg">{error}</div>
                 )}

                {!error && restaurant && view === 'menu' && (
                    <div className="space-y-8">
                         <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                            <h2 className="text-3xl font-bold text-white">{restaurant.restaurantName}</h2>
                            <p className="text-gray-400 mt-1">{restaurant.address}</p>
                         </div>
                         {Object.entries(menuItemsByCategory).length > 0 ? Object.entries(menuItemsByCategory).map(([category, items]) => (
                            <div key={category}>
                                <h2 className="text-2xl font-bold text-white capitalize mb-4">{category}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(items as MenuItem[]).filter(item => item.inStock).map(item => (
                                        <div key={item.id} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center border border-gray-800">
                                            <div>
                                                <h3 className="font-semibold text-white">{item.name}</h3>
                                                <p className="text-gray-400">₹{item.offlinePrice.toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => addToCart(item)} className="bg-lemon text-black font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-lemon-dark">ADD</button>
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
                     <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Your Cart</h2>
                        {cart.length === 0 ? <p className="text-gray-500">Your cart is empty.</p> : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center border border-gray-800">
                                        <div>
                                            <h3 className="font-semibold text-white">{item.name}</h3>
                                            <p className="text-lemon">₹{(item.offlinePrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-gray-800 w-8 h-8 rounded-full">-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-gray-800 w-8 h-8 rounded-full">+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t border-gray-800 mt-4 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-400"><span>Taxes (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-white font-bold text-xl"><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
                                </div>
                                <button onClick={() => setView('checkout')} className="w-full mt-6 bg-lemon text-black font-bold py-3 rounded-lg text-lg">Proceed to Checkout</button>
                            </div>
                        )}
                    </div>
                )}

                {!error && restaurant && view === 'checkout' && (
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Checkout</h2>
                        <form onSubmit={handlePlaceOrder} className="space-y-4 bg-gray-900 p-6 rounded-lg">
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your Name" required className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700"/>
                            <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Mobile Number" required className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700"/>
                             <div className="border-t border-gray-700 mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-gray-400"><span>Taxes (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                                <div className="flex justify-between text-white font-bold text-xl"><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
                             </div>
                             <button type="submit" className="w-full mt-4 bg-lemon text-black font-bold py-3 rounded-lg text-lg">Place Order</button>
                        </form>
                    </div>
                )}

                {!error && restaurant && view === 'confirmation' && <ConfirmationView />}
            </main>
        </div>
    );
};

export default CustomerOrderPage;