import React, { useEffect, useState } from 'react';
import { OrderItem } from '../types';

declare var Html5Qrcode: any;

interface ScanQrModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (orderData: { customerName: string; customerPhone: string; items: OrderItem[] }) => void;
}

const ScanQrModal: React.FC<ScanQrModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
    const [scanError, setScanError] = useState('');

    useEffect(() => {
        let qrScanner: any;
        if (isOpen) {
            setScanError('');
            qrScanner = new Html5Qrcode("qr-reader");

            const qrCodeSuccessCallback = (decodedText: string) => {
                try {
                    const orderData = JSON.parse(decodedText);
                     if (orderData.customerName && orderData.customerPhone && Array.isArray(orderData.items)) {
                        // Success handler in parent component will close the modal, triggering cleanup
                        onScanSuccess(orderData);
                    } else {
                        setScanError("Invalid order QR code format. Please ask the customer to generate it again.");
                    }
                } catch (e) {
                    setScanError("Failed to read QR code. This does not appear to be a valid order code.");
                    console.error("Invalid QR code data", e);
                }
            };
            
            const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };

            Html5Qrcode.getCameras().then((cameras: any[]) => {
                if (cameras && cameras.length) {
                    const cameraId = cameras.length > 1 ? cameras[1].id : cameras[0].id; // Prefer back camera
                    qrScanner.start({ deviceId: { exact: cameraId } }, config, qrCodeSuccessCallback, undefined)
                        .catch((err: any) => {
                            console.error("QR Scanner Start Error:", err);
                            setScanError("Could not start QR scanner. Please grant camera permission and refresh.");
                        });
                } else {
                    setScanError("No camera found on this device.");
                }
            }).catch((err: any) => {
                 console.error("Camera Permission Error:", err);
                 setScanError("Camera permission is required to scan QR codes. Please enable it in your browser settings.");
            });

            return () => {
                // Check if scanner was initialized and is running before trying to stop it
                if (qrScanner && qrScanner.isScanning) {
                    qrScanner.stop().catch((err: any) => {
                        console.warn("Failed to cleanly stop QR scanner:", err);
                    });
                }
            };
        }
    }, [isOpen, onScanSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md text-center relative border border-gray-700">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                <h3 className="text-xl font-semibold text-white mb-4">Scan Customer Order QR</h3>
                <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
                {scanError && <p className="text-lemon mt-4 text-sm">{scanError}</p>}
            </div>
        </div>
    );
};

export default ScanQrModal;