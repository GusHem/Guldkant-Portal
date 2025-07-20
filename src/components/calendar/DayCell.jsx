import React, { useContext, useRef, useState, useEffect } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';

const DayCell = ({ day, year, month, quotes, onSelect }) => {
    const { classes } = useContext(ThemeContext);
    const contentRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (contentRef.current) {
                setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
            }
        };
        // Timeout to allow DOM to render before checking
        const timeoutId = setTimeout(checkOverflow, 50);
        return () => clearTimeout(timeoutId);
    }, [quotes]);

    if (!day) {
        return <div className={`border ${classes.border} rounded-md h-28 sm:h-32 opacity-50`}></div>;
    }

    const dayDate = new Date(year, month, day);
    const dayStr = dayDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const todaysQuotes = quotes[dayStr] || [];
    const isToday = new Date().toDateString() === dayDate.toDateString();

    return (
        <div className={`relative border ${classes.border} rounded-md h-28 sm:h-32 p-1.5 text-left flex flex-col transition-colors ${todaysQuotes.length > 0 ? `bg-cyan-500/5` : ''}`}>
            <span className={`font-semibold text-sm ${isToday ? classes.accent : ''}`}>{day}</span>
            <div ref={contentRef} className="overflow-y-auto flex-grow text-xs space-y-1 mt-1 hide-scrollbar">
                {todaysQuotes.map(q => (
                    <div
                        key={q.id}
                        onClick={() => onSelect(q)}
                        className={`p-1 rounded bg-cyan-500/80 text-white cursor-pointer hover:bg-cyan-400 truncate ${focusClasses}`}
                    >
                        {q.customer}
                    </div>
                ))}
            </div>
            {isOverflowing && (
                <div className={`absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-${classes.bg === 'bg-gray-900' ? 'gray-800' : 'white'}/80 to-transparent pointer-events-none`}></div>
            )}
        </div>
    );
};

export default DayCell;