import React, { useContext, useMemo } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';
import InvoiceIcon from '../icons/InvoiceIcon.jsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.jsx';

const FollowUpWidget = ({ quotes, onSelect }) => {
    const { classes } = useContext(ThemeContext);
    const followUpItems = useMemo(() =>
        quotes.filter(q => q.status === 'genomförd').slice(0, 5),
        [quotes]
    );

    return (
        <div className={`p-4 rounded-lg shadow-md border ${classes.border} ${classes.cardBg} border-l-4 border-blue-500 flex flex-col h-full`}>
            <h3 className="font-bold mb-3 flex items-center gap-2 flex-shrink-0">
                <InvoiceIcon className="text-blue-500" />
                <span>Uppföljning & Fakturering</span>
            </h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {followUpItems.length === 0 ? (
                    <div className="text-center p-4 text-sm flex flex-col items-center justify-center h-full">
                        <CheckCircleIcon className={`w-8 h-8 ${classes.textSecondary} text-green-500`} />
                        <p className={`mt-2 ${classes.textSecondary}`}>Inga genomförda event väntar på fakturering.</p>
                    </div>
                ) : (
                    followUpItems.map(q => (
                        <div key={q.id} onClick={() => onSelect(q)} className={`p-2 rounded-md ${classes.inputBg} hover:bg-cyan-500/10 cursor-pointer transition-colors ${focusClasses}`}>
                            <p className="font-semibold text-sm">{q.kundNamn || q.customer}</p>
                            <p className={`text-xs ${classes.textSecondary}`}>Genomförd: {formatDate(q.eventDate)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FollowUpWidget;
