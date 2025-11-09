import React, { useState, useEffect } from 'react';
import { MOCK_MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';

const MenuItemFormModal: React.FC<{
    item: Partial<MenuItem> | null;
    onClose: () => void;
    onSave: (item: Partial<MenuItem>) => void;
}> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<MenuItem>>(item || { name: '', category: '', offlinePrice: 0, onlinePrice: 0, image: 'https://picsum.photos/100/100', inStock: true });

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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">{item?.id ? 'Edit Menu Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Item Name" className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700" required />
                    <input name="category" value={formData.category || ''} onChange={handleChange} placeholder="Category" className="w-full bg-gray-900 text-white p-2.5 rounded-lg border border-gray-700" required />
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


const Menu: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
        try {
            const savedItems = localStorage.getItem('babuSahabPos_menuItems');
            return savedItems ? JSON.parse(savedItems) : MOCK_MENU_ITEMS;
        } catch (error) {
            console.error("Error loading menu items from localStorage", error);
            return MOCK_MENU_ITEMS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('babuSahabPos_menuItems', JSON.stringify(menuItems));
        } catch (error) {
            console.error("Error saving menu items to localStorage", error);
        }
    }, [menuItems]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const toggleStock = (id: number) => {
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, inStock: !item.inStock } : item
        ));
    };
    
    const handleOpenModal = (item: MenuItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveItem = (itemData: Partial<MenuItem>) => {
        if (editingItem && editingItem.id) {
             setMenuItems(menuItems.map(item => item.id === editingItem.id ? { ...item, ...itemData } as MenuItem : item));
        } else {
            const newItem: MenuItem = {
                id: Date.now(),
                name: itemData.name || '',
                category: itemData.category || '',
                offlinePrice: itemData.offlinePrice || 0,
                onlinePrice: itemData.onlinePrice || 0,
                image: itemData.image || `https://picsum.photos/seed/${Date.now()}/100/100`,
                inStock: true,
            };
            setMenuItems(prevItems => [...prevItems, newItem]);
        }
        handleCloseModal();
    };
    
    const handleDeleteItem = (id: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
        }
    };

    const filteredItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {isModalOpen && <MenuItemFormModal item={editingItem} onClose={handleCloseModal} onSave={handleSaveItem} />}
            <div className="bg-black p-6 rounded-lg shadow-sm border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <input 
                        type="text" 
                        placeholder="Search items by name or category..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/2 bg-gray-900 text-white placeholder-gray-400 p-2.5 rounded-lg border border-gray-800 focus:outline-none focus:ring-1 focus:ring-lemon"
                    />
                    <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-lemon text-black font-bold py-2.5 px-5 rounded-lg hover:bg-lemon-dark transition">
                        Add New Item
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3">Image</th>
                                <th scope="col" className="px-6 py-3">Item Name</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Offline Price</th>
                                <th scope="col" className="px-6 py-3">Online Price</th>
                                <th scope="col" className="px-6 py-3">Stock Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className="bg-black border-b border-gray-800 hover:bg-gray-900">
                                    <td className="px-6 py-4"><img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover" /></td>
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.name}</th>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4">₹{item.offlinePrice.toFixed(2)}</td>
                                    <td className="px-6 py-4">₹{item.onlinePrice.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={item.inStock} onChange={() => toggleStock(item.id)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-lemon/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lemon"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 space-x-3 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(item)} className="font-medium text-blue-500 hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="font-medium text-red-500 hover:underline">Delete</button>
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

export default Menu;