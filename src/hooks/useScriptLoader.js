// FILNAMN: src/hooks/useScriptLoader.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to load external scripts and check for the availability of global objects.
 * @param {string[]} scriptUrls - Array of script URLs to load.
 * @returns {'loading' | 'ready' | 'error'} - The current status of the script loading process.
 */
const useScriptLoader = (scriptUrls) => {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let isMounted = true;

        const loadScripts = async () => {
            try {
                // Load all scripts in parallel
                await Promise.all(scriptUrls.map(url => new Promise((resolve, reject) => {
                    // Check if script already exists
                    if (document.querySelector(`script[src="${url}"]`)) {
                        return resolve();
                    }
                    const script = document.createElement('script');
                    script.src = url;
                    script.async = true;
                    script.onload = resolve;
                    script.onerror = () => reject(new Error(`Script load error for ${url}`));
                    document.head.appendChild(script);
                })));

                // Poll to check if the libraries are attached to the window object
                let retries = 20; // Poll for 10 seconds (20 * 500ms)
                const checkInterval = setInterval(() => {
                    if (!isMounted) {
                        clearInterval(checkInterval);
                        return;
                    }
                    // Specific check for jspdf and its autotable plugin
                    if (window.jspdf && typeof window.jspdf.jsPDF === 'function' && typeof window.jspdf.jsPDF.API.autoTable === 'function') {
                        clearInterval(checkInterval);
                        setStatus('ready');
                    } else if (retries-- === 0) {
                        clearInterval(checkInterval);
                        console.error('PDF libraries did not attach to window object after polling.');
                        setStatus('error');
                    }
                }, 500);

            } catch (error) {
                if (isMounted) {
                    console.error(error);
                    setStatus('error');
                }
            }
        };

        loadScripts();

        return () => {
            isMounted = false;
        };
    }, [scriptUrls]); // Re-run only if scriptUrls array changes

    return status;
};

export default useScriptLoader;