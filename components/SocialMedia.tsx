
import React, { useState, useRef, useEffect } from 'react';
import { RegisteredUser } from '../types';

interface SocialMediaProps {
    user: RegisteredUser;
}

// Expanded Image Categories with more high-quality Unsplash source images
const IMAGE_CATEGORIES: Record<string, string[]> = {
    "Indian Special": [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1505253758473-96b701d2cd25?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    ],
    "Biryani": [
         "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1599307767316-77f8d16eb512?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=600&q=80"
    ],
    "Fast Food": [
        "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1586190848861-99c9f3c18b67?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    ],
    "Pizza & Pasta": [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1593560708920-63984ed7743f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1555072956-7758afb20e8f?auto=format&fit=crop&w=600&q=80",
    ],
    "Chinese": [
        "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1541696490-8744a5dc0228?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80"
    ],
    "Healthy & Salad": [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    ],
    "Desserts & Drinks": [
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551024601-562963525638?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1579954115545-a95591f289f1?auto=format&fit=crop&w=600&q=80",
    ]
};

const SocialMedia: React.FC<SocialMediaProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'scheduler' | 'poster'>('scheduler');
    
    // Poster Creator State
    const [selectedCategory, setSelectedCategory] = useState("Indian Special");
    const [selectedImage, setSelectedImage] = useState(IMAGE_CATEGORIES["Indian Special"][0]);
    const [customText, setCustomText] = useState("Best Food in Town!");
    const [selectedMenuId, setSelectedMenuId] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Auto Post Logic (Simulated)
    const upcomingPosts = [
        { id: 1, date: new Date(Date.now() + 86400000).toDateString(), platform: 'Instagram & Facebook', status: 'Scheduled', content: 'Try our special Margherita Pizza today! 🍕' },
        { id: 2, date: new Date(Date.now() + 172800000).toDateString(), platform: 'Instagram', status: 'Scheduled', content: 'Hungry? We are open till 11 PM! 🍔' },
        { id: 3, date: new Date(Date.now() + 259200000).toDateString(), platform: 'Facebook', status: 'Scheduled', content: 'Order online and get fast delivery. 🚀' },
    ];

    // Draw Canvas
    useEffect(() => {
        if (activeTab === 'poster' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.crossOrigin = "anonymous";
            // Use high res for drawing if possible, or same URL
            img.src = selectedImage.replace('w=600', 'w=1080'); 
            
            img.onload = () => {
                // Clear and Draw Image
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Draw image maintaining aspect ratio cover (9:16)
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Overlay Gradient (Bottom)
                const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
                gradient.addColorStop(0, "transparent");
                gradient.addColorStop(0.6, "rgba(0,0,0,0.7)");
                gradient.addColorStop(1, "rgba(0,0,0,0.95)");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Overlay Gradient (Top) for Logo visibility
                const topGradient = ctx.createLinearGradient(0, 0, 0, 200);
                topGradient.addColorStop(0, "rgba(0,0,0,0.8)");
                topGradient.addColorStop(1, "transparent");
                ctx.fillStyle = topGradient;
                ctx.fillRect(0, 0, canvas.width, 200);

                // Text Settings
                ctx.textAlign = 'center';
                
                // Restaurant Name (Top)
                ctx.font = 'bold 80px sans-serif';
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#FFFF00'; // Lemon
                ctx.fillText(user.restaurantName.toUpperCase(), canvas.width / 2, 140);

                // Main Custom Text (Center-Bottom)
                ctx.font = 'bold 90px sans-serif';
                ctx.fillStyle = '#FFFFFF';
                
                // Simple text wrap for title
                const maxWidth = canvas.width - 100;
                const words = customText.split(' ');
                let line = '';
                let lineY = canvas.height - 400;

                if (words.length > 5) {
                     // Very simple logic to split long text into 2 lines roughly
                     const mid = Math.ceil(words.length / 2);
                     const line1 = words.slice(0, mid).join(' ');
                     const line2 = words.slice(mid).join(' ');
                     ctx.fillText(line1, canvas.width / 2, lineY - 50);
                     ctx.fillText(line2, canvas.width / 2, lineY + 50);
                } else {
                     ctx.fillText(customText, canvas.width / 2, lineY);
                }

                // Footer Info
                ctx.font = '40px sans-serif';
                ctx.fillStyle = '#DDDDDD';
                ctx.fillText("📍 " + user.address.split(',')[0], canvas.width / 2, canvas.height - 180);
                
                ctx.font = 'bold 45px sans-serif';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText("📞 Order Now: " + user.phone, canvas.width / 2, canvas.height - 100);
                
                // Border
                ctx.strokeStyle = "#FFFF00";
                ctx.lineWidth = 20;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
            };
        }
    }, [activeTab, selectedImage, customText, user]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `${user.restaurantName.replace(/\s+/g,'_')}_story.png`;
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };
    
    const randomizeImage = (category = selectedCategory) => {
        const images = IMAGE_CATEGORIES[category];
        const randomImg = images[Math.floor(Math.random() * images.length)];
        setSelectedImage(randomImg);
    };
    
    const handleMenuItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const itemId = e.target.value;
        setSelectedMenuId(itemId);
        
        if (!itemId) return;

        const menuItem = (user.menu || []).find(item => item.id.toString() === itemId);
        if (menuItem) {
            setCustomText(`${menuItem.name} @ ₹${menuItem.onlinePrice}`);
            
            // Try to match menu category to image category
            let matchedCategory = "Indian Special"; // Default
            const itemCat = menuItem.category.toLowerCase();
            
            // Simple keyword matching
            if (itemCat.includes('pizza') || itemCat.includes('pasta')) matchedCategory = "Pizza & Pasta";
            else if (itemCat.includes('burger') || itemCat.includes('sandwich') || itemCat.includes('fries')) matchedCategory = "Fast Food";
            else if (itemCat.includes('chinese') || itemCat.includes('noodle')) matchedCategory = "Chinese";
            else if (itemCat.includes('biryani') || itemCat.includes('rice')) matchedCategory = "Biryani";
            else if (itemCat.includes('salad') || itemCat.includes('healthy')) matchedCategory = "Healthy & Salad";
            else if (itemCat.includes('dessert') || itemCat.includes('cake') || itemCat.includes('drink')) matchedCategory = "Desserts & Drinks";

            if (matchedCategory !== selectedCategory) {
                setSelectedCategory(matchedCategory);
                randomizeImage(matchedCategory);
            }
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-white">Social Media Manager</h3>
                <div className="flex bg-gray-800 rounded-lg p-1">
                     <button 
                        onClick={() => setActiveTab('scheduler')}
                        className={`px-4 py-2 rounded-md font-bold text-sm transition ${activeTab === 'scheduler' ? 'bg-lemon text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Auto-Post Scheduler
                    </button>
                    <button 
                        onClick={() => setActiveTab('poster')}
                        className={`px-4 py-2 rounded-md font-bold text-sm transition ${activeTab === 'poster' ? 'bg-lemon text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Poster Creator (New)
                    </button>
                </div>
            </div>

            {activeTab === 'scheduler' && (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                         <div>
                             <h4 className="text-white font-bold">Automated Posting</h4>
                             <p className="text-sm text-gray-400 mt-1">
                                 {user.socialMedia?.autoPostEnabled 
                                    ? "Active: Posting daily content to your connected accounts." 
                                    : "Inactive: Enable Auto-Posting in Settings to start."}
                             </p>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-xs font-bold ${user.socialMedia?.autoPostEnabled ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                             {user.socialMedia?.autoPostEnabled ? 'RUNNING' : 'STOPPED'}
                         </div>
                    </div>

                    <h4 className="text-lg font-bold text-lemon">Upcoming Scheduled Posts</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Platform</th>
                                    <th className="px-6 py-3">Content Preview</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingPosts.map(post => (
                                    <tr key={post.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4">{post.date}</td>
                                        <td className="px-6 py-4">{post.platform}</td>
                                        <td className="px-6 py-4">"{post.content}"</td>
                                        <td className="px-6 py-4 text-yellow-400">{post.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'poster' && (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        
                        {/* Menu Item Selector */}
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <label className="text-sm font-bold text-lemon block mb-2">★ Quick Create from Menu</label>
                            <select 
                                value={selectedMenuId} 
                                onChange={handleMenuItemSelect}
                                className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lemon"
                            >
                                <option value="">-- Select a Menu Item --</option>
                                {(user.menu || []).map(item => (
                                    <option key={item.id} value={item.id}>{item.name} - ₹{item.onlinePrice}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-2">Selecting an item automatically updates the text and background category.</p>
                        </div>

                        <hr className="border-gray-800" />

                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">1. Choose Category</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.keys(IMAGE_CATEGORIES).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setSelectedImage(IMAGE_CATEGORIES[cat][0]); }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${selectedCategory === cat ? 'bg-lemon text-black' : 'bg-gray-800 text-gray-300'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <label className="text-sm font-bold text-gray-400 block mb-2">2. Select Background</label>
                            <div className="grid grid-cols-4 gap-2">
                                {IMAGE_CATEGORIES[selectedCategory].map((src, idx) => (
                                    <img 
                                        key={idx} 
                                        src={src} 
                                        alt="Food bg" 
                                        onClick={() => setSelectedImage(src)}
                                        className={`w-full aspect-[9/16] object-cover rounded cursor-pointer border-2 ${selectedImage === src ? 'border-lemon' : 'border-transparent hover:border-gray-500'}`}
                                    />
                                ))}
                            </div>
                            <button onClick={() => randomizeImage()} className="text-xs text-lemon mt-2 hover:underline">
                                ↻ Randomize Selection
                            </button>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">3. Custom Text (Editable)</label>
                            <input 
                                type="text" 
                                value={customText} 
                                onChange={e => setCustomText(e.target.value)} 
                                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lemon"
                            />
                        </div>
                        <button onClick={handleDownload} className="w-full bg-lemon text-black font-bold py-3 rounded-lg hover:bg-lemon-dark transition flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Story Poster (9:16)
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center items-center bg-gray-800 rounded-lg p-4">
                        {/* 
                            Canvas resolution is 1080x1920 (High quality)
                            Displayed at smaller size via CSS
                        */}
                        <canvas 
                            ref={canvasRef} 
                            width={1080} 
                            height={1920} 
                            className="max-w-[300px] h-auto shadow-2xl rounded border-4 border-gray-900"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialMedia;
