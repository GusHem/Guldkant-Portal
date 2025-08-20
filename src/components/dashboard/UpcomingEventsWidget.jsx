import React, { useContext, useMemo } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';
import CalendarCheckIcon from '../icons/CalendarCheckIcon.jsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.jsx';

const UpcomingEventsWidget = ({ quotes, onSelect }) => {
    const { classes } = useContext(ThemeContext);
    
    // ============ DEBUG START ============
    console.log('🔍 UPCOMING EVENTS WIDGET DEBUG');
    console.log('Total quotes received:', quotes.length);
    console.log('All quotes:', quotes.map(q => ({
        namn: q.kundNamn || q.customer,
        status: q.status,
        eventDate: q.eventDate,
        eventDatum: q.eventDatum,
        faktiskDatum: q.eventDate || q.eventDatum
    })));
    
    // Hitta Erik specifikt
    const erikQuote = quotes.find(q => 
        (q.kundNamn && q.kundNamn.toLowerCase().includes('erik')) || 
        (q.customer && q.customer.toLowerCase().includes('erik'))
    );
    
    if (erikQuote) {
        console.log('✅ ERIK FOUND:', {
            namn: erikQuote.kundNamn || erikQuote.customer,
            status: erikQuote.status,
            statusLower: erikQuote.status?.toLowerCase(),
            eventDate: erikQuote.eventDate,
            eventDatum: erikQuote.eventDatum,
            actualDate: erikQuote.eventDate || erikQuote.eventDatum,
            fullObject: erikQuote
        });
    } else {
        console.log('❌ ERIK NOT FOUND IN DATA');
    }
    // ============ DEBUG END ============
    
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        console.log('Current date for comparison:', now.toISOString());
        
        const filtered = quotes.filter(q => {
            const status = q.status?.toLowerCase();
            const eventDate = q.eventDate || q.eventDatum;
            const dateObj = eventDate ? new Date(eventDate) : null;
            
            // Debug varje Erik
            if (q.kundNamn?.toLowerCase().includes('erik') || q.customer?.toLowerCase().includes('erik')) {
                console.log('🎯 ERIK FILTER CHECK:', {
                    namn: q.kundNamn || q.customer,
                    status: status,
                    statusMatches: ['godkänd', 'betald'].includes(status),
                    eventDate: eventDate,
                    dateObj: dateObj?.toISOString(),
                    isInFuture: dateObj >= now,
                    willPass: ['godkänd', 'betald'].includes(status) && eventDate && dateObj >= now
                });
            }
            
            return ['godkänd', 'betald'].includes(status) && eventDate && new Date(eventDate) >= now;
        });
        
        console.log('Filtered upcoming events count:', filtered.length);
        console.log('Filtered events:', filtered.map(q => q.kundNamn || q.customer));
        
        return filtered
            .sort((a, b) => {
                const dateA = new Date(a.eventDate || a.eventDatum);
                const dateB = new Date(b.eventDate || b.eventDatum);
                return dateA - dateB;
            })
            .slice(0, 5);
    }, [quotes]);

    return (
        <div className={`p-4 rounded-lg shadow-md border ${classes.border} ${classes.cardBg} border-l-4 border-green-500 flex flex-col h-full`}>
            <h3 className="font-bold mb-3 flex items-center gap-2 flex-shrink-0">
                <CalendarCheckIcon className="text-green-500" />
                <span>Kommande Event</span>
            </h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {upcomingEvents.length === 0 ? (
                    <div className="text-center p-4 text-sm flex flex-col items-center justify-center h-full">
                        <CheckCircleIcon className={`w-8 h-8 ${classes.textSecondary} text-green-500`} />
                        <p className={`mt-2 ${classes.textSecondary}`}>Inga kommande event inbokade.</p>
                    </div>
                ) : (
                    upcomingEvents.map(q => (
                        <div key={q.id} onClick={() => onSelect(q)} className={`p-2 rounded-md ${classes.inputBg} hover:bg-cyan-500/10 cursor-pointer transition-colors ${focusClasses}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm">{q.kundNamn || q.customer}</p>
                                {q.status === 'betald' && <span className="text-xs font-bold text-purple-400">BETALD</span>}
                            </div>
                            <p className={`text-xs ${classes.textSecondary}`}>
                                Eventdatum: {formatDate(q.eventDate || q.eventDatum)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingEventsWidget;