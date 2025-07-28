import React, { useContext, useMemo } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';
import CalendarCheckIcon from '../icons/CalendarCheckIcon.jsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.jsx';

const UpcomingEventsWidget = ({ quotes, onSelect }) => {
    const { classes } = useContext(ThemeContext);
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return quotes.filter(q => ['godkänd', 'betald'].includes(q.status) && new Date(q.eventDate) >= now)
                     .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
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
                            <p className={`text-xs ${classes.textSecondary}`}>Eventdatum: {formatDate(q.eventDate)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingEventsWidget;
