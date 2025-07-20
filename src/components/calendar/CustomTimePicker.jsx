import React, { useRef, useMemo, useEffect, useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';

const CustomTimePicker = ({ isOpen, onClose, value, onChange }) => {
    const { classes } = useContext(ThemeContext);
    const createPaddedArray = (size) => Array.from({ length: size }, (_, i) => i.toString().padStart(2, '0'));
    
    // Use memoization to create arrays that are 3x the size for infinite looping effect
    const extendedHours = useMemo(() => { const h = createPaddedArray(24); return [...h, ...h, ...h]; }, []);
    const extendedMinutes = useMemo(() => { const m = createPaddedArray(60); return [...m, ...m, ...m]; }, []);

    const hourRef = useRef(null);
    const minuteRef = useRef(null);
    const scrollTimeout = useRef(null);
    
    const ITEM_HEIGHT = 36; // Corresponds to h-9 in Tailwind
    const HALF_VISIBLE_ITEMS = 2; // Number of items visible above/below the center line

    useEffect(() => {
        if (isOpen && value) {
            const [h, m] = value.split(':');
            // Delay scrolling to allow the component to render and refs to be attached
            setTimeout(() => {
                if (hourRef.current) {
                    const hourIndex = extendedHours.indexOf(h, 24); // Start search from the middle section
                    hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
                }
                if (minuteRef.current) {
                    const minuteIndex = extendedMinutes.indexOf(m, 60); // Start search from the middle section
                    minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
                }
            }, 50);
        }
    }, [isOpen, value, extendedHours, extendedMinutes]);

    const handleScroll = (ref, sectionSize) => {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            if (!ref.current) return;
            const { scrollTop, clientHeight } = ref.current;
            const totalHeight = ref.current.scrollHeight - clientHeight;

            // "Infinite" scroll logic
            if (scrollTop < ITEM_HEIGHT * sectionSize) {
                ref.current.scrollTop += ITEM_HEIGHT * sectionSize;
            } else if (scrollTop >= totalHeight - (ITEM_HEIGHT * sectionSize)) {
                ref.current.scrollTop -= ITEM_HEIGHT * sectionSize;
            }
            
            // Snap to nearest item
            const nearestIndex = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
            ref.current.scrollTo({ top: nearestIndex * ITEM_HEIGHT, behavior: 'smooth' });
        }, 250); // Debounce time
    };

    const handleSetTime = () => {
        if (!hourRef.current || !minuteRef.current) return;
        const hourIndex = Math.round(hourRef.current.scrollTop / ITEM_HEIGHT);
        const minuteIndex = Math.round(minuteRef.current.scrollTop / ITEM_HEIGHT);
        onChange(`${extendedHours[hourIndex]}:${extendedMinutes[minuteIndex]}`);
        onClose();
    };

    if (!isOpen) return null;

    const columnPadding = { height: `${ITEM_HEIGHT * HALF_VISIBLE_ITEMS}px` };

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${classes.modalOverlay}`} onClick={onClose}>
            <div className={`${classes.cardBg} w-full max-w-xs rounded-xl shadow-2xl p-4 flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="relative h-48 flex justify-center items-center text-2xl font-mono gap-2 overflow-hidden">
                    {/* Center line indicator */}
                    <div className={`absolute top-1/2 -translate-y-1/2 h-10 w-full rounded-lg border-2 ${classes.accent} ${classes.border} border-opacity-50 pointer-events-none`}></div>
                    
                    {/* Hours Column */}
                    <div ref={hourRef} onScroll={() => handleScroll(hourRef, 24)} className="h-full w-1/2 overflow-y-scroll scroll-smooth snap-y snap-mandatory hide-scrollbar">
                        <div style={columnPadding}></div>
                        {extendedHours.map((h, i) => <div key={`h-${i}`} className="flex items-center justify-center h-9 snap-center">{h}</div>)}
                        <div style={columnPadding}></div>
                    </div>
                    
                    <span>:</span>
                    
                    {/* Minutes Column */}
                    <div ref={minuteRef} onScroll={() => handleScroll(minuteRef, 60)} className="h-full w-1/2 overflow-y-scroll scroll-smooth snap-y snap-mandatory hide-scrollbar">
                        <div style={columnPadding}></div>
                        {extendedMinutes.map((m, i) => <div key={`m-${i}`} className="flex items-center justify-center h-9 snap-center">{m}</div>)}
                        <div style={columnPadding}></div>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <button onClick={onClose} className={`w-full ${classes.buttonSecondaryBg} ${classes.buttonSecondaryText} ${classes.buttonSecondaryHover} px-4 py-2 rounded-lg font-semibold transition-colors ${focusClasses}`}>Avbryt</button>
                    <button onClick={handleSetTime} className={`w-full ${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-4 py-2 rounded-lg font-semibold transition-colors ${focusClasses}`}>Ställ in</button>
                </div>
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default CustomTimePicker;