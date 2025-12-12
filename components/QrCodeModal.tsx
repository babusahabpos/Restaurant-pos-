
import React, { useState, useEffect, useRef } from 'react';

// Declare the qrcode function from the global script loaded in index.html
declare var qrcode: any;
declare var jspdf: any;

interface UrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuUrl: string;
    restaurantName?: string;
}

const UrlModal: React.FC<UrlModalProps> = ({ isOpen, onClose, menuUrl, restaurantName = "Scan Menu" }) => {
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        if (isOpen && menuUrl && qrCodeRef.current) {
            try {
                if (typeof qrcode === 'undefined') {
                    throw new Error("QR Generator library not loaded");
                }
                // Type 0 = auto-detect, 'L' = low error correction
                const qr = qrcode(0, 'L');
                qr.addData(menuUrl);
                qr.make();
                // cellSize = 6px, margin = 4 cells
                qrCodeRef.current.innerHTML = qr.createImgTag(6, 4); 
            } catch (error) {
                console.error("Failed to generate QR code:", error);
                if (qrCodeRef.current) {
                    qrCodeRef.current.innerHTML = '<p class="text-red-500 text-sm p-2">Could not generate QR code. Library missing.</p>';
                }
            }
        }
    }, [isOpen, menuUrl]);

    const handleDownloadPdf = () => {
        try {
            if (typeof jspdf === 'undefined') {
                alert("PDF Generator library not loaded. Please refresh.");
                return;
            }

            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            
            // Generate QR Code Modules directly for vector-like quality (drawing rectangles)
            const qr = qrcode(0, 'M'); // Medium Error Correction for print
            qr.addData(menuUrl);
            qr.make();
            const moduleCount = qr.getModuleCount();
            
            // Setup Dimensions for A4
            const pageWidth = 210;
            const pageHeight = 297;
            const centerX = pageWidth / 2;
            
            // Header: Restaurant Name
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(restaurantName, centerX, 40, { align: "center" });
            
            // Sub-header
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text("Online Ordering Menu", centerX, 50, { align: "center" });

            // Draw QR Code
            const qrSize = 100; // 100mm
            const qrX = (pageWidth - qrSize) / 2;
            const qrY = 70;
            const cellSize = qrSize / moduleCount;

            doc.setFillColor(0, 0, 0); // Black modules
            for (let r = 0; r < moduleCount; r++) {
                for (let c = 0; c < moduleCount; c++) {
                    if (qr.isDark(r, c)) {
                        doc.rect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize, 'F');
                    }
                }
            }

            // Footer Text "Scan to Order"
            doc.setFontSize(28);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("SCAN TO ORDER", centerX, qrY + qrSize + 25, { align: "center" });

            // Instructions
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Open your camera app or any QR scanner to view menu", centerX, qrY + qrSize + 35, { align: "center" });

            // Save PDF
            doc.save(`${restaurantName.replace(/\s+/g, '_')}_QR.pdf`);

        } catch (error) {
            console.error("PDF Generation Error", error);
            alert("Failed to generate PDF.");
        }
    };
    
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
                
                <div className="flex flex-col gap-4">
                     {/* URL Copy Section */}
                    <div className="flex items-center bg-black p-2 rounded-lg border border-gray-700">
                        <input 
                            type="text" 
                            value={menuUrl} 
                            readOnly 
                            className="flex-grow bg-transparent text-gray-300 border-none focus:ring-0 text-sm"
                        />
                        <button 
                            onClick={handleCopy}
                            className={`ml-2 font-bold py-2 px-3 rounded-lg transition text-sm ${copied ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                         <a 
                            href={menuUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600"
                        >
                            Open Link
                        </a>
                        <button 
                            onClick={handleDownloadPdf}
                            className="flex-1 bg-lemon text-black font-bold py-3 px-4 rounded-lg hover:bg-lemon-dark flex justify-center items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrlModal;
