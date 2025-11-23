import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, RegisteredUser } from '../types';
import QrCodeModal from './QrCodeModal';

interface QrMenuProps {
    menu: MenuItem[];
    setMenu: (menu: MenuItem[]) => void;
    loggedInUser: RegisteredUser;
}

const AddCategoryModal: React.FC<{
    onClose: () => void;
    onSave: (categoryName: string) => void;
}> = ({ onClose, onSave }) => {
    const [categoryName, setCategoryName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryName.trim()) {
            onSave(categoryName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Category</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const MenuItemFormModal: React.FC<{
    item: Partial<MenuItem> | null;
    onClose: () => void;
    onSave: (item: Partial<MenuItem>) => void;
    categories: string[];
}> = ({ item, onClose, onSave, categories }) => {
    const [formData, setFormData] = useState<Partial<MenuItem>>(item || { name: '', category: '', offlinePrice: 0, onlinePrice: 0, inStock: true });

    useEffect(() => {
        setFormData(item || { name: '', category: '', offlinePrice: 0, onlinePrice: 0, inStock: true });
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData({ ...formData, [name]: isNumber ? parseFloat(value) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">{item?.id ? 'Edit Menu Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Item Name" className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700" required />
                    <select
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700"
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input name="offlinePrice" value={formData.offlinePrice || ''} onChange={handleChange} type="number" step="0.01" placeholder="Offline Price" className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700" required />
                    <input name="onlinePrice" value={formData.onlinePrice || ''} onChange={handleChange} type="number" step="0.01" placeholder="Online Price" className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700" required />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const QrMenu: React.FC<QrMenuProps> = ({ menu = [], setMenu, loggedInUser }) => {
    // Safety check
    const validMenuItems = useMemo(() => (menu || []).filter(item => item && item.name && item.category), [menu]);

    const [categories, setCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [menuUrl, setMenuUrl] = useState('');

    useEffect(() => {
        const uniqueCategories = [...new Set(validMenuItems.map(item => item.category))];
        setCategories(uniqueCategories.sort());
    }, [validMenuItems]);

    const toggleStock = (id: number) => {
        setMenu(menu.map(item =>
            item.id === id ? { ...item, inStock: !item.inStock } : item
        ));
    };
    
    const handleOpenItemModal = (item: MenuItem | null = null) => {
        const initialData = item ? item : { category: selectedCategory || '', inStock: true };
        setEditingItem(initialData);
        setIsItemModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsItemModalOpen(false);
        setIsCategoryModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveItem = (itemData: Partial<MenuItem>) => {
        if (editingItem && 'id' in editingItem && editingItem.id) {
             setMenu(menu.map(item => item.id === editingItem.id ? { ...item, ...itemData } as MenuItem : item));
        } else {
            const newItem: MenuItem = {
                id: Date.now(),
                name: itemData.name || '',
                category: itemData.category || '',
                offlinePrice: itemData.offlinePrice || 0,
                onlinePrice: itemData.onlinePrice || 0,
                inStock: itemData.inStock !== false,
            };
            setMenu([...menu, newItem]);
        }
        handleCloseModals();
    };
    
    const handleDeleteItem = (id: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setMenu(menu.filter(item => item.id !== id));
        }
    };

    const handleSaveCategory = (categoryName: string) => {
        if (!categories.find(c => c.toLowerCase() === categoryName.toLowerCase())) {
            setCategories(prev => [...prev, categoryName].sort());
        }
        handleCloseModals();
    };

    const filteredCategories = categories.filter(category => {
        return category.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleGenerateUrl = () => {
        const dataToEncode = {
            id: loggedInUser.id,
            restaurantName: loggedInUser.restaurantName,
            address: loggedInUser.address,
            menu: menu,
        };
        const stringifiedData = JSON.stringify(dataToEncode);
        
        const sessionKey = `babuSahabPos_menu_${loggedInUser.id}`;
        try {
            sessionStorage.setItem(sessionKey, stringifiedData);
        } catch (e) {
            console.error("Could not write to sessionStorage. QR link may be too long.", e);
        }

        const encodedData = encodeURIComponent(btoa(stringifiedData));

        const url = `${window.location.origin}${window.location.pathname.replace('index.html', '')}#customer-order?key=${sessionKey}&data=${encodedData}`;

        setMenuUrl(url);
        setIsUrlModalOpen(true);
    };


    const renderCategoryGrid = () => (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input 
                    type="text" 
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:flex-grow bg-gray-900 text-white placeholder-gray-400 p-2.5 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon focus:border-lemon"
                />
                <button onClick={() => setIsCategoryModalOpen(true)} className="w-full md:w-auto bg-lemon text-black font-bold py-2.5 px-5 rounded-lg hover:bg-lemon-dark transition">
                    Add New Category
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCategories.map(category => (
                    <div key={category} onClick={() => setSelectedCategory(category)} className="bg-gray-900 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:ring-2 hover:ring-lemon transition border border-gray-800 h-32">
                        <h4 className="text-lg font-bold text-white capitalize">{category}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                            {validMenuItems.filter(item => item.category === category).length} items
                        </p>
                    </div>
                ))}
            </div>
        </>
    );

    const renderItemView = () => {
        if (!selectedCategory) return null;
        const itemsToShow = validMenuItems.filter(item => item.category === selectedCategory && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
            <>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                     <button onClick={() => { setSelectedCategory(null); setSearchTerm(''); }} className="flex items-center gap-2 bg-gray-800 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-700 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back
                    </button>
                    <input 
                        type="text" 
                        placeholder={`Search in ${selectedCategory}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:flex-grow bg-gray-900 text-white placeholder-gray-400 p-2.5 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon"
                    />
                    <button onClick={() => handleOpenItemModal()} className="w-full md:w-auto bg-lemon text-black font-bold py-2.5 px-5 rounded-lg hover:bg-lemon-dark transition">
                        Add New Item
                    </button>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <h4 className="text-xl font-bold text-lemon mb-4 capitalize">{selectedCategory}</h4>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-3 py-2 text-xs text-gray-400 font-bold uppercase">
                        <div className="col-span-5">Item Name</div>
                        <div className="col-span-2 text-right">Offline Price</div>
                        <div className="col-span-2 text-right">Online Price</div>
                        <div className="col-span-1 text-center">Stock</div>
                        <div className="col-span-2 text-center">Actions</div>
                    </div>
                    <div className="space-y-2">
                        {itemsToShow.map(item => (
                            <div key={item.id} className="bg-gray-800 p-3 rounded-lg grid grid-cols-2 md:grid-cols-12 md:gap-4 items-center">
                                <div className="col-span-2 md:col-span-5 font-medium text-white">{item.name}</div>
                                <div className="text-right md:text-right md:col-span-2 text-sm text-gray-300">
                                    <span className="md:hidden text-gray-500 text-xs">OFFLINE: </span>₹{item.offlinePrice.toFixed(2)}
                                </div>
                                <div className="text-right md:text-right md:col-span-2 text-sm text-gray-300">
                                     <span className="md:hidden text-gray-500 text-xs">ONLINE: </span>₹{item.onlinePrice.toFixed(2)}
                                </div>
                                <div className="md:col-span-1 flex justify-center items-center my-2 md:my-0">
                                     <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={item.inStock} onChange={() => toggleStock(item.id)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-900 rounded-full peer peer-focus:ring-2 peer-focus:ring-lemon/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lemon"></div>
                                    </label>
                                </div>
                                <div className="col-span-2 md:col-span-2 flex justify-center items-center gap-4 mt-2 md:mt-0">
                                    <button onClick={() => handleOpenItemModal(item)} className="font-medium text-blue-500 hover:underline text-sm">Edit</button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="font-medium text-red-500 hover:underline text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            {isItemModalOpen && <MenuItemFormModal item={editingItem} onClose={handleCloseModals} onSave={handleSaveItem} categories={categories} />}
            {isCategoryModalOpen && <AddCategoryModal onClose={handleCloseModals} onSave={handleSaveCategory} />}
            {isUrlModalOpen && <QrCodeModal isOpen={isUrlModalOpen} onClose={() => setIsUrlModalOpen(false)} menuUrl={menuUrl} />}

            <div className="space-y-6">
                <div className="bg-black p-4 md:p-6 rounded-lg shadow-sm border border-gray-800">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-800 pb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">QR Menu Management</h3>
                            <p className="text-gray-400 mt-1">Manage your menu items and generate QR codes for customers.</p>
                        </div>
                        <button onClick={handleGenerateUrl} className="flex items-center gap-2 bg-lemon text-black font-bold py-3 px-6 rounded-lg hover:bg-lemon-dark transition shadow-lg shadow-lemon/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            Generate QR Code
                        </button>
                    </div>

                    {selectedCategory === null ? renderCategoryGrid() : renderItemView()}
                </div>
            </div>
        </>
    );
};

export default QrMenu;