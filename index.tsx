import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("SYSTEM: Boot Sequence Initiated.");

const initializeApp = () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error("SYSTEM: Error - Root container not found in DOM.");
        return;
    }

    try {
        console.log("SYSTEM: Creating React root...");
        const root = createRoot(container);
        
        console.log("SYSTEM: Rendering application tree...");
        root.render(<App />);
        
        // Finalize loading process
        setTimeout(() => {
            const loader = document.getElementById('initial-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    if (loader.parentNode) loader.remove();
                    console.log("SYSTEM: Boot Sequence Complete. App Online.");
                }, 500);
            }
        }, 600);

    } catch (err) {
        console.error("SYSTEM: Fatal Mount Error", err);
        const status = document.getElementById('loader-status');
        if (status) {
            status.innerText = "FAILED TO START: " + (err instanceof Error ? err.message : "Unknown Panic");
            status.style.color = "#ff4444";
        }
    }
};

// Start initialization once DOM is interactive
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeApp();
} else {
    window.addEventListener('load', initializeApp);
}

// Exposure for manual recovery if needed
(window as any).forceAppReload = initializeApp;