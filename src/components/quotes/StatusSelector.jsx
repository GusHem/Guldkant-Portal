import React, { useState, useRef, useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { statusTextMap, statusColors } from '../../utils/helpers';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import CaretUpDownIcon from '../icons/CaretUpDownIcon.jsx';

const StatusSelector = ({ quote, onStatusChange }) => {
    const { classes } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef(null);

    useOnClickOutside(selectorRef, () => setIsOpen(false));

    const statusOptions = Object.keys(statusTextMap).map(id => ({ 
        id, 
        label: statusTextMap[id] 
    }));

    const handleSelect = (newStatus) => {
        onStatusChange(quote, newStatus);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={selectorRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className={`relative w-full cursor-pointer rounded-md border ${classes.border} ${classes.inputBg} py-2 pl-3 pr-10 text-left text-sm shadow-sm ${focusClasses}`}
            >
                <span className="flex items-center">
                    <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusColors[quote.status]}`}></span>
                    <span className="ml-3 block truncate">{statusTextMap[quote.status]}</span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <CaretUpDownIcon className={`h-5 w-5 ${classes.textSecondary}`} />
                </span>
            </button>

            {isOpen && (
                <div 
                    className={`absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md ${classes.cardBg} py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
                    style={{ 
                        position: 'absolute',
                        zIndex: 50,
                        transform: 'translateZ(0)'
                    }}
                >
                    {statusOptions.map(option => (
                        <div
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`flex cursor-pointer select-none items-center p-2 transition-colors hover:${classes.inputBg}`}
                        >
                            <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusColors[option.id]}`}></span>
                            <span className={`ml-3 block truncate ${quote.status === option.id ? `font-semibold ${classes.accent}` : 'font-normal'}`}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusSelector;
