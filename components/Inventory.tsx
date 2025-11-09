import React, { useState, useEffect } from 'react';
import { MOCK_INVENTORY_ITEMS } from '../constants';
import { InventoryItem } from '../types';

const InventoryFormModal: React.FC<{
    item: Partial<InventoryItem> | null;
    onClose: () => void;
    onSave: (item: InventoryItem) => void;
}> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>(item || { name: '', category: '', quantity: 0, unit: '', lowStockThreshold: 0 });
    const isEditing = !!item?.id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData({ ...formData, [name]: isNumber ? parseFloat(value) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as InventoryItem);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-black p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">{isEditing ? 'Update Stock' : 'Add New Stock'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Item Name" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required disabled={isEditing} />
                    <input name="category" value={formData.category || ''} onChange={handleChange} placeholder="Category" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required disabled={isEditing} />
                    <input name="quantity" value={formData.quantity || ''} onChange={handleChange} type="number" placeholder="Quantity" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required />
                    <input name="unit" value={formData.unit || ''} onChange={handleChange} placeholder="Unit (e.g., kg, liters)" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required disabled={isEditing}/>
                    <input name="lowStockThreshold" value={formData.lowStockThreshold || ''} onChange={handleChange} type="number" placeholder="Low Stock Threshold" className="w-full bg-gray-900 text-white p-2 rounded border border-gray-800" required disabled={isEditing} />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Inventory: React.FC = () => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
        try {
            const savedItems = localStorage.getItem('babuSahabPos_inventoryItems');
            return savedItems ? JSON.parse(savedItems) : MOCK_INVENTORY_ITEMS;
        } catch (error) {
            console.error("Error loading inventory items from localStorage", error);
            return MOCK_INVENTORY_ITEMS;
        }
    });
    
    useEffect(() => {
        try {
            localStorage.setItem('babuSahabPos_inventoryItems', JSON.stringify(inventoryItems));
        } catch (error) {
            console.error("Error saving inventory items to localStorage", error);
        }
    }, [inventoryItems]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const isLowStock = (item: InventoryItem) => item.quantity <= item.lowStockThreshold;

    const handleOpenModal = (item: InventoryItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveItem = (itemData: InventoryItem) => {
        if (editingItem) {
            setInventoryItems(inventoryItems.map(item => item.id === editingItem.id ? { ...item, quantity: itemData.quantity } : item));
        } else {
            const newItem = { ...itemData, id: Date.now() };
            setInventoryItems([...inventoryItems, newItem]);
        }
        handleCloseModal();
    };

    return (
        <>
            {isModalOpen && <InventoryFormModal item={editingItem} onClose={handleCloseModal} onSave={handleSaveItem} />}
            <div className="bg-black p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-lg font-semibold text-white">Inventory Items</h3>
                    <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-lemon text-black font-bold py-2 px-4 rounded-lg hover:bg-lemon-dark transition">
                        Add New Stock
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3">Item Name</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Quantity</th>
                                <th scope="col" className="px-6 py-3">Unit</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItems.map(item => (
                                <tr key={item.id} className="bg-black border-b border-gray-800 hover:bg-gray-900">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.name}</th>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4">{item.quantity}</td>
                                    <td className="px-6 py-4">{item.unit}</td>
                                    <td className="px-6 py-4">
                                        {isLowStock(item) ? (
                                            <span className="bg-lemon/20 text-lemon text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Low Stock</span>
                                        ) : (
                                            <span className="bg-green-900 text-green-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">In Stock</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-400 font-medium">Update</button>
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

export default Inventory;