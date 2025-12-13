
import React, { useState, useEffect } from 'react';
import { RegisteredUser, UserStatus, MenuItem } from '../../types';
import { GoogleGenAI, Type } from "@google/genai";

// Helper to get API key safely from various environment configurations
const getApiKey = () => {
    // Try standard process.env (Next.js, Node, Webpack with DefinePlugin)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    // Try Vite standard (import.meta.env)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
    return '';
};

const SendMessageModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSend: (userId: number, message: string) => void;
}> = ({ user, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Send Message to {user.name}</h3>
                <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={() => { onSend(user.id, message); onClose(); }} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Send</button>
                </div>
            </div>
        </div>
    );
};

const PasswordManagerModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, newPass: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    
    const handleSave = () => {
        if (newPassword) {
            onSave(user.id, newPassword);
            onClose();
        } else {
            alert('New password cannot be empty.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Manage Password for {user.name}</h3>
                <div className='space-y-4'>
                    <p className="text-sm text-gray-400">Current Password: <span className="font-mono text-lemon bg-gray-700 px-2 py-1 rounded">{user.password}</span></p>
                    <input 
                        type="text"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-gray-700 text-white p-2 rounded"
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Change Password</button>
                </div>
            </div>
        </div>
    );
};

const SubscriptionModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, newDate: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [date, setDate] = useState(user.subscriptionEndDate);

    const handleSave = () => {
        if (date) {
            onSave(user.id, date);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Update Subscription for {user.name}</h3>
                <div className='space-y-2'>
                    <label className="text-sm text-gray-400">Subscription End Date</label>
                    <input 
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-gray-700 text-white p-2 rounded"
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-lemon text-black font-bold py-2 px-4 rounded-lg">Update Date</button>
                </div>
            </div>
        </div>
    );
};

const MenuUploadModal: React.FC<{
    user: RegisteredUser;
    onClose: () => void;
    onSave: (userId: number, menu: MenuItem[]) => void;
}> = ({ user, onClose, onSave }) => {
    const [menu, setMenu] = useState<MenuItem[]>(user.menu || []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [userApiKey, setUserApiKey] = useState('');
    const [filePreview, setFilePreview] = useState<string | null>(null);

    // Manual Entry State
    const [manualName, setManualName] = useState('');
    const [manualCategory, setManualCategory] = useState('');
    const [manualPrice, setManualPrice] = useState('');

    const handleAddManualItem = () => {
        if(!manualName || !manualPrice) {
            alert("Name and Price are required.");
            return;
        }
        const newItem: MenuItem = {
            id: Date.now(),
            name: manualName,
            category: manualCategory || 'General',
            offlinePrice: Number(manualPrice) || 0,
            onlinePrice: Number(manualPrice) || 0,
            inStock: true
        };
        setMenu(prev => [...prev, newItem]);
        setManualName('');
        setManualPrice('');
        setManualCategory('');
    };

    // Robust Image Compression
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1600; 
                    const MAX_HEIGHT = 1600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // Convert to JPEG with 0.8 quality
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        resolve(dataUrl.split(',')[1]);
                    } else {
                        reject(new Error("Canvas context is null"));
                    }
                };
                img.onerror = (error) => reject(new Error("Failed to load image for compression"));
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setLoadingMessage('Loading image...');

        // 1. Generate Preview immediately for Manual Reference
        try {
            const rawBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            setFilePreview(rawBase64);
        } catch(e) {
            console.error("Preview failed", e);
        }

        try {
            // --- API Key Check ---
            // 1. Try manual input first
            let apiKey = userApiKey.trim();
            // 2. Try environment variables if manual input is empty
            if (!apiKey) {
                apiKey = getApiKey();
            }
            
            // 3. Try AI Studio context if available
            if (typeof window !== 'undefined' && (window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    try {
                        setLoadingMessage('Please select your API Key...');
                        await (window as any).aistudio.openSelectKey();
                    } catch (e) {
                        console.log("Key selection skipped");
                    }
                }
            }
            
            // Check process.env one last time
            if (!apiKey) apiKey = getApiKey();

            if (!apiKey) {
                 // GRACEFUL FALLBACK
                 setIsProcessing(false);
                 setLoadingMessage('');
                 alert("No API Key detected. You can use the uploaded image as a reference to add items manually.");
                 return;
            }
            
            setLoadingMessage('Processing file...');

            let base64Data = '';
            let mimeType = file.type;

            // Helper to read raw base64 with reliable mime detection
            const readRawFile = (f: File): Promise<{data: string, mime: string}> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        if (!result) { reject(new Error("File is empty")); return; }
                        
                        const parts = result.split(',');
                        const meta = parts[0]; 
                        const rawData = parts[1];
                        // Extract mime from data url if possible, else use file.type or default
                        const extractedMime = meta.match(/:(.*?);/)?.[1] || f.type || 'image/jpeg';
                        
                        resolve({ data: rawData, mime: extractedMime });
                    };
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsDataURL(f);
                });
            };

            const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            
            if (isPDF) {
                 const raw = await readRawFile(file);
                 base64Data = raw.data;
                 mimeType = 'application/pdf';
            } else {
                // Assume Image strategy
                try {
                    setLoadingMessage('Optimizing image...');
                    // Try compression first (best for bandwidth)
                    base64Data = await compressImage(file);
                    mimeType = 'image/jpeg'; // Compression result is always JPEG
                } catch (e) {
                    console.warn("Compression failed (likely HEIC or unsupported format), falling back to raw upload.", e);
                    setLoadingMessage('Uploading original image...');
                    
                    // Fallback to raw file (Supports HEIC, etc.)
                    const raw = await readRawFile(file);
                    base64Data = raw.data;
                    mimeType = raw.mime;

                    if (file.size > 15 * 1024 * 1024) {
                        throw new Error("Image is too large (over 15MB) and could not be compressed. Please use a smaller image.");
                    }
                }
            }

            setLoadingMessage('AI is analyzing menu items...');
            
            const ai = new GoogleGenAI({ apiKey });
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: base64Data } },
                        { text: "Analyze this restaurant menu (Image or PDF). Extract all menu items. Return a JSON object with a key 'menu' containing an array of items. Each item must have: 'name' (string), 'category' (string, infer from headers like 'Starters', 'Main Course', etc.), and 'price' (number). If an item has multiple prices, use the first one. Ignore currency symbols. Do not hallucinate items." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            menu: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        category: { type: Type.STRING },
                                        price: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                if (data.menu && Array.isArray(data.menu)) {
                    const newItems: MenuItem[] = data.menu.map((item: any, index: number) => ({
                        id: Date.now() + index,
                        name: item.name,
                        category: item.category || 'General',
                        offlinePrice: item.price || 0,
                        onlinePrice: item.price || 0,
                        inStock: true
                    }));
                    
                    setMenu(prev => [...prev, ...newItems]);
                    alert(`Success! Extracted ${newItems.length} items.`);
                } else {
                    alert("AI processed the file but found no menu structure. Please try a clearer file.");
                }
            }
        } catch (error: any) {
            console.error("AI Extraction Error:", error);
            let msg = error.message || "Unknown error";
            
            if (msg.includes('API key') || msg.includes('403') || msg.includes('401')) {
                msg = "Invalid or missing API Key. You can still use the image reference to add items manually.";
            }
            
            alert(`Failed to extract menu automatically. ${msg}`);
        } finally {
            setIsProcessing(false);
            setLoadingMessage('');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };
    
    const handleDeleteItem = (id: number) => {
        if(confirm("Are you sure you want to delete this item?")) {
            setMenu(menu.filter(m => m.id !== id));
        }
    }

    const handleSaveAll = () => {
        onSave(user.id, menu);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-semibold text-white">Manage Menu for {user.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
                    {/* Input Section (Upload + Manual) */}
                    <div className="w-full md:w-1/3 bg-gray-900 p-4 rounded-lg overflow-y-auto flex flex-col gap-6">
                        {/* Upload */}
                        <div>
                            <h4 className="text-lemon font-bold mb-4">Upload Menu Card</h4>
                            
                            {/* API Key Input */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 block mb-1">Gemini API Key (Optional for AI)</label>
                                <input
                                    type="password"
                                    value={userApiKey}
                                    onChange={(e) => setUserApiKey(e.target.value)}
                                    placeholder="Paste key to auto-extract items"
                                    className="w-full bg-gray-700 text-white p-2 rounded text-xs border border-gray-600 focus:border-lemon outline-none"
                                />
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] text-lemon hover:underline block mt-1 text-right">Get API Key</a>
                            </div>

                            <div className="space-y-4">
                                {filePreview ? (
                                    <div className="relative border border-gray-600 rounded-lg overflow-hidden group">
                                        <img src={filePreview} alt="Menu Preview" className="w-full h-auto max-h-64 object-contain bg-black" />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <input 
                                                type="file" 
                                                accept="image/*,application/pdf,.heic,.heif"
                                                onChange={handleFileUpload}
                                                id="menu-change"
                                                className="hidden"
                                                disabled={isProcessing}
                                            />
                                            <label htmlFor="menu-change" className="cursor-pointer bg-lemon text-black font-bold py-2 px-4 rounded text-sm hover:bg-lemon-dark">
                                                Change Image
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-lemon transition-colors">
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf,.heic,.heif"
                                            onChange={handleFileUpload}
                                            id="menu-upload"
                                            className="hidden"
                                            disabled={isProcessing}
                                        />
                                        <label htmlFor="menu-upload" className="cursor-pointer block">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="mt-1 text-sm text-gray-400">Upload Photo</p>
                                        </label>
                                    </div>
                                )}
                                
                                {isProcessing && (
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lemon"></div>
                                        <p className="text-lemon text-sm mt-2">{loadingMessage}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manual Entry Fallback */}
                        <div className="border-t border-gray-700 pt-4">
                            <h4 className="text-lemon font-bold mb-3">Manual Entry</h4>
                            <p className="text-xs text-gray-500 mb-3">Use the image above as reference.</p>
                            <div className="space-y-3">
                                <input 
                                    value={manualName}
                                    onChange={e => setManualName(e.target.value)}
                                    placeholder="Item Name" 
                                    className="w-full bg-gray-800 text-white p-2 rounded text-sm border border-gray-700"
                                />
                                <input 
                                    value={manualCategory}
                                    onChange={e => setManualCategory(e.target.value)}
                                    placeholder="Category (e.g. Starter)" 
                                    className="w-full bg-gray-800 text-white p-2 rounded text-sm border border-gray-700"
                                />
                                <input 
                                    value={manualPrice}
                                    onChange={e => setManualPrice(e.target.value)}
                                    type="number"
                                    placeholder="Price" 
                                    className="w-full bg-gray-800 text-white p-2 rounded text-sm border border-gray-700"
                                />
                                <button 
                                    onClick={handleAddManualItem}
                                    className="w-full bg-gray-700 hover:bg-white hover:text-black text-white font-bold py-2 rounded text-sm transition-colors"
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Menu List */}
                    <div className="w-full md:w-2/3 bg-gray-900 p-4 rounded-lg overflow-y-auto">
                        <h4 className="text-white font-bold mb-4 sticky top-0 bg-gray-900 pb-2 border-b border-gray-800">Current Menu Items ({menu.length})</h4>
                        <div className="space-y-2">
                            {menu.length === 0 ? <p className="text-gray-500 text-center mt-10">No items yet.</p> : 
                             menu.slice().reverse().map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-800 p-2 rounded border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-white font-semibold text-sm">{item.name}</p>
                                            <p className="text-gray-400 text-xs">{item.category} | ₹{item.offlinePrice}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300 px-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-6 rounded hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSaveAll} className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700">Save All Changes</button>
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC<{
    users: RegisteredUser[];
    onBlockUser: (userId: number, shouldBlock: boolean) => void;
    onSendMessage: (userId: number | 'all', message: string) => void;
    onPasswordChange: (userId: number, newPass: string) => void;
    onUpdateSubscription: (userId: number, newDate: string) => void;
    onUpdateMenu: (userId: number, menu: MenuItem[]) => void;
    onDeleteUser: (userId: number) => void;
}> = ({ users, onBlockUser, onSendMessage, onPasswordChange, onUpdateSubscription, onUpdateMenu, onDeleteUser }) => {
    
    const [messagingUser, setMessagingUser] = useState<RegisteredUser | null>(null);
    const [passwordUser, setPasswordUser] = useState<RegisteredUser | null>(null);
    const [subscriptionUser, setSubscriptionUser] = useState<RegisteredUser | null>(null);
    const [menuUser, setMenuUser] = useState<RegisteredUser | null>(null);

     const getStatusChip = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Approved: return <span className="bg-green-800 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">Approved</span>;
            case UserStatus.Pending: return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Pending</span>;
            case UserStatus.Rejected: return <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">Rejected</span>;
            case UserStatus.Blocked: return <span className="bg-lemon/20 text-lemon text-xs font-medium px-2.5 py-1 rounded-full">Blocked</span>;
            case UserStatus.Deleted: return <span className="bg-red-900 text-red-300 text-xs font-medium px-2.5 py-1 rounded-full">Deleted</span>;
        }
    };

    const getReferrerName = (code: string | undefined) => {
        if (!code) return '-';
        const referrer = users.find(u => u.referralCode === code);
        return referrer ? `${referrer.restaurantName} (${referrer.name})` : code;
    };

    const handleDeleteClick = (userId: number) => {
        if (confirm("Are you sure you want to delete this user? The user will not be able to login.")) {
            onDeleteUser(userId);
        }
    };

    return (
        <>
        {messagingUser && <SendMessageModal user={messagingUser} onClose={() => setMessagingUser(null)} onSend={onSendMessage} />}
        {passwordUser && <PasswordManagerModal user={passwordUser} onClose={() => setPasswordUser(null)} onSave={onPasswordChange} />}
        {subscriptionUser && <SubscriptionModal user={subscriptionUser} onClose={() => setSubscriptionUser(null)} onSave={onUpdateSubscription} />}
        {menuUser && <MenuUploadModal user={menuUser} onClose={() => setMenuUser(null)} onSave={onUpdateMenu} />}

        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-white">User Management</h3>
                 <input type="text" placeholder="Search users..." className="w-full md:w-1/2 bg-gray-800 text-white p-2 rounded-lg border border-gray-700" />
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Restaurant</th>
                            <th scope="col" className="px-6 py-3">Owner</th>
                            <th scope="col" className="px-6 py-3">Referred By</th>
                            <th scope="col" className="px-6 py-3">Subscription End</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.restaurantName}</th>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4 text-lemon">{getReferrerName(user.referredBy)}</td>
                                <td className="px-6 py-4">{user.subscriptionEndDate}</td>
                                <td className="px-6 py-4">{getStatusChip(user.status)}</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    {user.status !== UserStatus.Deleted && (
                                        <>
                                            {user.status === UserStatus.Approved && <button onClick={() => onBlockUser(user.id, true)} className="font-medium text-lemon hover:underline">Block</button>}
                                            {user.status === UserStatus.Blocked && <button onClick={() => onBlockUser(user.id, false)} className="font-medium text-green-500 hover:underline">Unblock</button>}
                                            <button onClick={() => setMessagingUser(user)} className="font-medium text-blue-500 hover:underline">Message</button>
                                            <button onClick={() => setPasswordUser(user)} className="font-medium text-lemon hover:underline">Password</button>
                                            <button onClick={() => setSubscriptionUser(user)} className="font-medium text-teal-500 hover:underline">Subscription</button>
                                            <button onClick={() => setMenuUser(user)} className="font-medium text-yellow-500 hover:underline">Menu Upload</button>
                                            <button onClick={() => handleDeleteClick(user.id)} className="font-medium text-red-500 hover:underline">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default UserManagement;
