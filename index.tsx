import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

console.log("SYSTEM: Boot Sequence Initiated (Legacy Mode).");

const initializeApp = () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error("SYSTEM: Root container not found.");
        return;
    }

    try {
        console.log("SYSTEM: Mounting React tree (v17)...");
        
        // Use React 17 Render Style
        ReactDOM.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
            container
        );
        
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
            status.innerText = "FAILED TO START: CHECK CONSOLE";
            status.style.color = "#ff4444";
        }
    }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeApp();
} else {
    window.addEventListener('load', initializeApp);
}

// Exposure for manual recovery if needed
(window as any).forceAppReload = initializeApp;