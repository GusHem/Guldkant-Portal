import React, { useContext, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';
import DayCell from './DayCell.jsx';
import ChevronLeftIcon from '../icons/ChevronLeftIcon.jsx';
import ChevronRightIcon from '../icons/ChevronRightIcon.jsx';

const TactileCalendar = ({ quotes, onSelect }) => {
    const { classes } = useContext(ThemeContext);
    const [activeMonthIndex, setActiveMonthIndex] = useState(0);
    const [scrollAbility, setScrollAbility] = useState({ atStart: false, atEnd: false });
    const monthScrollerRef = useRef(null);
    const monthRefs = useRef({});
    const scrollTimeout = useRef(null);
    const isInitialMount = useRef(true);

    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('sv-SE', { month: 'long' })), []);
    const years = useMemo(() => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i), []);
    const monthYearCombination = useMemo(() => years.flatMap(year => months.map((month, index) => ({ year, month, monthIndex: index }))), [years, months]);
    
    const currentDate = useMemo(() => {
        const activeItem = monthYearCombination[activeMonthIndex];
        return activeItem ? new Date(activeItem.year, activeItem.monthIndex, 1) : new Date();
    }, [activeMonthIndex, monthYearCombination]);

    const checkScrollAbility = useCallback(() => {
        if (!monthScrollerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = monthScrollerRef.current;
        setScrollAbility({ atStart: scrollLeft < 10, atEnd: scrollLeft > scrollWidth - clientWidth - 10 });
    }, []);

    useEffect(() => {
        const initialIndex = monthYearCombination.findIndex(m => m.year === new Date().getFullYear() && m.monthIndex === new Date().getMonth());
        if (initialIndex !== -1) setActiveMonthIndex(initialIndex);
    }, [monthYearCombination]);

    useEffect(() => {
        const targetElement = monthRefs.current[activeMonthIndex];
        if (targetElement && monthScrollerRef.current) {
            const behavior = isInitialMount.current ? 'auto' : 'smooth';
            monthScrollerRef.current.scrollTo({
                left: targetElement.offsetLeft - (monthScrollerRef.current.offsetWidth / 2) + (targetElement.offsetWidth / 2),
                behavior: behavior
            });
            if (isInitialMount.current) isInitialMount.current = false;
        }
    }, [activeMonthIndex]);

    const handleScroll = () => {
        checkScrollAbility();
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            if (!monthScrollerRef.current) return;
            const container = monthScrollerRef.current;
            const containerCenter = container.scrollLeft + container.offsetWidth / 2;
            let closestIndex = -1, smallestDistance = Infinity;
            for (const key in monthRefs.current) {
                const el = monthRefs.current[key];
                if (el) {
                    const elCenter = el.offsetLeft + el.offsetWidth / 2;
                    const distance = Math.abs(containerCenter - elCenter);
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        closestIndex = parseInt(key, 10);
                    }
                }
            }
            if (closestIndex !== -1 && activeMonthIndex !== closestIndex) {
                setActiveMonthIndex(closestIndex);
            } else if (closestIndex !== -1) {
                const targetElement = monthRefs.current[closestIndex];
                if(targetElement) container.scrollTo({ left: targetElement.offsetLeft - (container.offsetWidth / 2) + (targetElement.offsetWidth / 2), behavior: 'smooth' });
            }
        }, 200);
    };

    const handleArrowClick = (direction) => {
        const newIndex = Math.max(0, Math.min(monthYearCombination.length - 1, activeMonthIndex + direction));
        setActiveMonthIndex(newIndex);
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const placeholders = Array(dayOffset).fill(null);
        const grid = [...placeholders, ...days];
        const quotesByDate = quotes.reduce((acc, quote) => {
            if (quote.eventDate) {
                const dateStr = formatDate(quote.eventDate);
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(quote);
            }
            return acc;
        }, {});
        return { grid, quotesByDate, year, month };
    }, [currentDate, quotes]);

    const { grid, quotesByDate, year, month } = calendarGrid;
    const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(2024, 0, i + 1).toLocaleDateString('sv-SE', { weekday: 'long' })), []);

    return (
        <div className={`${classes.cardBg} p-4 rounded-lg shadow-xl border ${classes.border} overflow-hidden max-w-4xl mx-auto`}>
            <div className="relative mb-4 flex items-center">
                <button onClick={() => handleArrowClick(-1)} className={`absolute left-0 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-all duration-300 ${classes.text} ${scrollAbility.atStart ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${focusClasses}`} aria-label="Föregående månad"><ChevronLeftIcon /></button>
                <div ref={monthScrollerRef} onScroll={handleScroll} className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 hide-scrollbar">
                    {monthYearCombination.map(({ year, month, monthIndex }, index) => (
                        <div key={`${year}-${monthIndex}`} ref={el => monthRefs.current[index] = el} className={`flex-shrink-0 snap-center px-6 py-2 cursor-pointer transition-all duration-300 select-none ${activeMonthIndex === index ? `text-xl font-bold ${classes.accent}` : `text-lg ${classes.textSecondary} opacity-60 scale-90`}`}>
                            <span className="capitalize">{month}</span>
                            <span className={`${classes.textSecondary} text-base`}>{year}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => handleArrowClick(1)} className={`absolute right-0 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-all duration-300 ${classes.text} ${scrollAbility.atEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${focusClasses}`} aria-label="Nästa månad"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekdays.map((day, i) => <div key={i} className={`font-bold text-sm capitalize ${classes.textSecondary}`}>{day.substring(0, 3)}</div>)}
                {grid.map((day, index) => (
                    <DayCell key={day || `ph-${index}`} day={day} year={year} month={month} quotes={quotesByDate} onSelect={onSelect} />
                ))}
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}

export default TactileCalendar;