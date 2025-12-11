
import React, { useState, useRef, useEffect } from 'react';
import { RegisteredUser, MenuItem } from '../types';

interface SocialMediaProps {
    user: RegisteredUser;
}

// --- Image Library ---
const IMAGE_CATEGORIES: Record<string, string[]> = {
    "Indian Special": [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1505253758473-96b701d2cd25?auto=format&fit=crop&w=600&q=80",
    ],
    "Biryani": [
         "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
    ],
    "Fast Food": [
        "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80", // Burger
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", // Pizza
        "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80", // Fries
    ],
    "Pizza": [
         "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
         "https://images.unsplash.com/photo-1593560708920-63984dc36f3e?auto=format&fit=crop&w=600&q=80",
    ],
    "Desserts": [
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80", // Cake
        "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80", // Donut
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", // Cake dark
    ],
    "Chinese": [
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80", // Noodles
        "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80", // Dumplings
    ]
};

// --- Theme System ---
type ThemeType = 'Classic' | 'Elegant' | 'Bold' | 'Modern' | 'Minimal';

interface PosterData {
    restaurantName: string;
    address: string;
    phone: string;
    itemName: string;
    price: string;
    tagline: string;
}

const THEMES: { name: ThemeType; draw: (ctx: CanvasRenderingContext2D, w: number, h: number, data: PosterData) => void }[] = [
    {
        name: 'Classic',
        draw: (ctx, w, h, data) => {
            // Gradient Overlay
            const gradient = ctx.createLinearGradient(0, h * 0.4, 0, h);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.7, 'rgba(0,0,0,0.8)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            // Text Styles
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFF00'; // Lemon
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText(data.restaurantName.toUpperCase(), w / 2, h - 220);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText(data.itemName, w / 2, h - 160);

            if (data.price) {
                ctx.fillStyle = '#FFFF00';
                ctx.font = 'bold 50px sans-serif';
                ctx.fillText(data.price, w / 2, h - 100);
            }

            ctx.fillStyle = '#CCCCCC';
            ctx.font = '20px sans-serif';
            ctx.fillText(`${data.address} | 📞 ${data.phone}`, w / 2, h - 40);
        }
    },
    {
        name: 'Elegant',
        draw: (ctx, w, h, data) => {
            // Darker Overlay
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, w, h);

            // Gold Border
            ctx.strokeStyle = '#D4AF37'; // Gold
            ctx.lineWidth = 15;
            ctx.strokeRect(30, 30, w - 60, h - 60);

            // Top Header
            ctx.textAlign = 'center';
            ctx.fillStyle = '#D4AF37';
            ctx.font = 'bold 40px serif';
            ctx.fillText(data.restaurantName, w / 2, 100);

            // Center Item
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'italic bold 70px serif';
            ctx.fillText(data.itemName, w / 2, h / 2);
            ctx.shadowBlur = 0;

            // Price Tag
            if (data.price) {
                ctx.fillStyle = '#D4AF37';
                ctx.font = 'bold 60px serif';
                ctx.fillText(data.price, w / 2, h / 2 + 80);
            }

            // Bottom Contact
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '22px serif';
            ctx.fillText("Order Now: " + data.phone, w / 2, h - 80);
        }
    },
    {
        name: 'Bold',
        draw: (ctx, w, h, data) => {
            // Slanted Background for Text
            ctx.fillStyle = '#FFFF00'; // Lemon
            ctx.beginPath();
            ctx.moveTo(0, h - 350);
            ctx.lineTo(w, h - 450);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();

            // Text
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = '900 65px Impact, sans-serif';
            ctx.fillText(data.itemName.toUpperCase(), 40, h - 250);

            if (data.price) {
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 50px sans-serif';
                ctx.fillText("ONLY " + data.price, 40, h - 180);
            }

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 30px sans-serif';
            ctx.fillText(data.restaurantName.toUpperCase(), 40, h - 100);
            
            ctx.font = '20px sans-serif';
            ctx.fillText("📞 " + data.phone, 40, h - 60);
        }
    },
    {
        name: 'Modern',
        draw: (ctx, w, h, data) => {
            // White Box at bottom center
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.fillRect(40, h - 300, w - 80, 260);
            ctx.shadowBlur = 0;

            // Text inside box
            ctx.textAlign = 'center';
            ctx.fillStyle = '#E63946'; // Red
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText("SPECIAL OFFER", w / 2, h - 250);

            ctx.fillStyle = '#1D3557'; // Navy
            ctx.font = 'bold 50px sans-serif';
            ctx.fillText(data.itemName, w / 2, h - 190);

            if (data.price) {
                ctx.fillStyle = '#457B9D';
                ctx.font = 'bold 40px sans-serif';
                ctx.fillText(data.price, w / 2, h - 140);
            }

            ctx.fillStyle = 'black';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(data.restaurantName, w / 2, h - 80);
        }
    },
    {
        name: 'Minimal',
        draw: (ctx, w, h, data) => {
            // Full Overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(40, 40, w - 80, h - 80);
            
            // Image Cutout (simulated by clearing rect, but here we just draw on top)
            // Since we can't easily 'cut out' the image without advanced compositing in this simple setup,
            // We will just draw a clean frame.
            
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, 50, w - 100, h - 100);

            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            ctx.font = '100 80px sans-serif'; // Thin
            ctx.fillText(data.itemName, w / 2, h / 2);

            ctx.font = '20px monospace';
            ctx.fillText(data.restaurantName.toUpperCase(), w / 2, h / 2 + 60);

            if (data.price) {
                ctx.fillStyle = '#E63946';
                ctx.font = 'bold 40px sans-serif';
                ctx.fillText(data.price, w / 2, h / 2 + 120);
            }
        }
    }
];

const SocialMedia: React.FC<SocialMediaProps> = ({ user }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("Indian Special");
    const [bgImage, setBgImage] = useState<string>(IMAGE_CATEGORIES["Indian Special"][0]);
    const [customText, setCustomText] = useState("");
    const [selectedMenuId, setSelectedMenuId] = useState<number | "">("");
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

    const categories = Object.keys(IMAGE_CATEGORIES);

    // Filter menu items that are valid
    const menuItems = (user.menu || []).filter(item => item && item.name);

    const handleRandomize = () => {
        const images = IMAGE_CATEGORIES[selectedCategory];
        const randomImg = images[Math.floor(Math.random() * images.length)];
        setBgImage(randomImg);
        // Also randomize theme
        setCurrentThemeIndex(Math.floor(Math.random() * THEMES.length));
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `poster-${user.restaurantName.replace(/\s+/g, '-')}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };
    
    const handleMenuItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedMenuId(id);
        
        // Smart Category Match
        const item = menuItems.find(i => i.id === id);
        if (item) {
            const matchedCat = categories.find(c => item.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(item.category.toLowerCase()));
            if (matchedCat) {
                setSelectedCategory(matchedCat);
                // Pick random image from that cat
                const images = IMAGE_CATEGORIES[matchedCat];
                setBgImage(images[Math.floor(Math.random() * images.length)]);
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = bgImage;

        img.onload = () => {
            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background Image (Cover Fit)
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;
            ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

            // Determine Text Content
            let itemName = customText || "Special Delicacy";
            let price = "";
            
            if (selectedMenuId) {
                const item = menuItems.find(i => i.id === selectedMenuId);
                if (item) {
                    itemName = item.name;
                    price = `₹${item.onlinePrice || item.offlinePrice}`;
                }
            }

            const posterData: PosterData = {
                restaurantName: user.restaurantName,
                address: user.address,
                phone: user.phone,
                itemName: itemName,
                price: price,
                tagline: "Taste the Best!"
            };

            // Draw Theme
            const theme = THEMES[currentThemeIndex];
            theme.draw(ctx, canvas.width, canvas.height, posterData);
        };
    }, [bgImage, user, customText, selectedMenuId, currentThemeIndex]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col lg:flex-row gap-8">
                {/* Controls */}
                <div className="lg:w-1/2 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Poster Creator Studio</h3>
                        <p className="text-gray-400 text-sm">Create stunning 9:16 stories for WhatsApp, Instagram, and Facebook.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Source Selection */}
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Select from Menu (Auto-fill)</label>
                            <select 
                                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
                                value={selectedMenuId}
                                onChange={handleMenuItemChange}
                            >
                                <option value="">-- Choose Item --</option>
                                {menuItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name} - ₹{item.onlinePrice}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <div className="h-px bg-gray-700 flex-1"></div>
                             <span className="text-gray-500 text-xs uppercase">OR Custom Text</span>
                             <div className="h-px bg-gray-700 flex-1"></div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Custom Text (Overrides Menu)</label>
                            <input 
                                type="text" 
                                value={customText} 
                                onChange={e => setCustomText(e.target.value)} 
                                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700" 
                                placeholder="e.g. Sunday Special Offer!"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Background Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1 text-sm rounded-full border transition ${selectedCategory === cat ? 'bg-lemon text-black border-lemon' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                             <button 
                                onClick={handleRandomize}
                                className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                Shuffle Image & Theme
                            </button>
                             
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentThemeIndex((prev) => (prev + 1) % THEMES.length)}
                                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                                >
                                    Change Style ({THEMES[currentThemeIndex].name})
                                </button>
                                <button 
                                    onClick={handleDownload}
                                    className="flex-1 bg-lemon text-black font-bold py-3 rounded-lg hover:bg-lemon-dark flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download Poster
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg mt-6">
                        <h4 className="font-bold text-white mb-2">Social Media Links</h4>
                        <div className="flex gap-4">
                             {user.socialMedia?.instagram ? (
                                 <a href={`https://instagram.com/${user.socialMedia.instagram.replace('@', '')}`} target="_blank" className="text-pink-500 hover:text-pink-400 flex items-center gap-1">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                     Instagram
                                 </a>
                             ) : <span className="text-gray-600">No Instagram linked</span>}
                             
                             {user.socialMedia?.facebook ? (
                                 <a href={user.socialMedia.facebook.startsWith('http') ? user.socialMedia.facebook : `https://${user.socialMedia.facebook}`} target="_blank" className="text-blue-500 hover:text-blue-400 flex items-center gap-1">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                     Facebook
                                 </a>
                             ) : <span className="text-gray-600">No Facebook linked</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Update links in Settings.</p>
                    </div>
                </div>

                {/* Preview Canvas */}
                <div className="lg:w-1/2 flex justify-center bg-gray-800 rounded-lg p-4">
                    <canvas 
                        ref={canvasRef} 
                        width={540} 
                        height={960} 
                        className="w-full max-w-[360px] h-auto shadow-2xl rounded-lg bg-white"
                    />
                </div>
            </div>
        </div>
    );
};

export default SocialMedia;
