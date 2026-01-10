import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("SYSTEM: Boot Sequence Initiated (React 18).");

const initializeApp = () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error("SYSTEM: Root container not found in DOM.");
        const status = document.getElementById('loader-status');
        if (status) status.innerText = "FATAL: DOM ROOT MISSING";
        return;
    }

    try {
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        
        // Hide loader after a short delay to ensure React has rendered the first frame
        setTimeout(() => {
            const loader = document.getElementById('initial-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    if (loader.parentNode) loader.remove();
                    console.log("SYSTEM: Boot Sequence Complete.");
                }, 500);
            }
        }, 800);

    } catch (err) {
        console.error("SYSTEM: Fatal Mount Error", err);
        const status = document.getElementById('loader-status');
        if (status) {
            status.innerText = "ERROR: " + (err instanceof Error ? err.message : "PANIC");
            status.style.color = "#ff4444";
        }
    }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeApp();
} else {
    window.addEventListener('load', initializeApp);
}