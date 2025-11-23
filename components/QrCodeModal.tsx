import React, { useState, useEffect, useRef } from 'react';

// Declare the qrcode function from the global script loaded in index.html
declare var qrcode: any;

interface UrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuUrl: string;
}

const UrlModal: React.FC<UrlModalProps> = ({ isOpen, onClose, menuUrl }) => {
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        if (isOpen && menuUrl && qrCodeRef.current) {
            try {
                // Type 0 = auto-detect, 'L' = low error correction
                const qr = qrcode(0, 'L');
                qr.addData(menuUrl);
                qr.make();
                // cellSize = 6px, margin = 4 cells
                qrCodeRef.current.innerHTML = qr.createImgTag(6, 4); 
            } catch (error) {
                console.error("Failed to generate QR code:", error);
                if (qrCodeRef.current) {
                    qrCodeRef.current.innerHTML = '<p class="text-red-500">Could not generate QR code.</p>';
                }
            }
        }
    }, [isOpen, menuUrl]);
    
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(menuUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy URL to clipboard.');
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-lg text-center relative border border-gray-700">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                <h3 className="text-xl font-semibold text-white mb-4">Share Your Menu</h3>
                <p className="text-gray-400 mb-6">Customers can scan this QR code or use the link to view your menu and place an order directly from their table.</p>
                
                <div 
                    ref={qrCodeRef} 
                    className="bg-white p-4 rounded-lg inline-block mb-6 border-4 border-lemon"
                    style={{ minHeight: '150px' }} 
                >
                    {/* QR code image will be injected here by useEffect */}
                </div>
                
                <div className="flex items-center bg-black p-2 rounded-lg border border-gray-700">
                     <input 
                        type="text" 
                        value={menuUrl} 
                        readOnly 
                        className="flex-grow bg-transparent text-gray-300 border-none focus:ring-0 text-sm"
                    />
                    <button 
                        onClick={handleCopy}
                        className={`ml-2 font-bold py-2 px-4 rounded-lg transition ${copied ? 'bg-green-600 text-white' : 'bg-lemon text-black hover:bg-lemon-dark'}`}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrlModal;