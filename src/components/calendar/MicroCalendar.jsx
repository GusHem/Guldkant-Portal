import React, { useContext, useState, useMemo, useRef } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import ChevronLeftIcon from '../icons/ChevronLeftIcon.jsx';
import ChevronRightIcon from '../icons/ChevronRightIcon.jsx';
import CalendarIcon from '../icons/CalendarIcon.jsx'; // Added this import

const MicroCalendar = ({ selectedDate, onDateSelect, onClose }) => {
    const { classes } = useContext(ThemeContext);
    const [displayDate, setDisplayDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const calendarRef = useRef(null);
    useOnClickOutside(calendarRef, onClose);

    const changeMonth = (amount) => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const grid = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        return [...Array(dayOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    }, [displayDate]);

    const weekdays = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('sv-SE', { weekday: 'narrow' });
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7); // Start on a Monday
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return formatter.format(day);
        });
    }, []);

    const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;

    return (
        <div ref={calendarRef} className={`absolute top-full mt-2 z-20 w-72 p-3 rounded-lg shadow-2xl border ${classes.border} ${classes.cardBg}`}>
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => changeMonth(-1)} className={`p-1 rounded-full hover:${classes.inputBg} ${focusClasses}`}><ChevronLeftIcon className="w-5 h-5" /></button>
                <span className="font-semibold text-md capitalize">{formatDate(displayDate, { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className={`p-1 rounded-full hover:${classes.inputBg} ${focusClasses}`}><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekdays.map((day, index) => <div key={index} className={`font-bold text-xs uppercase ${classes.textSecondary}`}>{day}</div>)}
                {grid.map((day, index) => {
                    if (!day) return <div key={`ph-${index}`}></div>;
                    const fullDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
                    const isSelected = formatDate(fullDate) === selectedDateStr;
                    return (
                        <button key={day} onClick={() => onDateSelect(fullDate)} className={`w-9 h-9 rounded-full text-sm transition-colors ${focusClasses} ${isSelected ? `bg-cyan-500 text-white font-bold` : `hover:${classes.inputBg}`}`}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MicroCalendar;