import React, { useContext, useMemo } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { statusTextMap } from '../../utils/helpers';
import AlertCircleIcon from '../icons/AlertCircleIcon.jsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.jsx';

const ActionableQuotesWidget = ({ quotes, onSelect }) => {
    const { classes } = useContext(ThemeContext);
    const actionItems = useMemo(() =>
        quotes.filter(q => q.status === 'utkast' || q.status === 'förslag-skickat')
              .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)),
        [quotes]
    );

    return (
        <div className={`p-4 rounded-lg shadow-md border ${classes.border} ${classes.cardBg} border-l-4 border-yellow-500 flex flex-col h-full`}>
            <h3 className="font-bold mb-3 flex items-center gap-2 flex-shrink-0">
                <AlertCircleIcon className="text-yellow-500" />
                <span>Ärenden som kräver åtgärd</span>
            </h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {actionItems.length === 0 ? (
                    <div className="text-center p-4 text-sm flex flex-col items-center justify-center h-full">
                        <CheckCircleIcon className={`w-8 h-8 ${classes.textSecondary} text-green-500`} />
                        <p className={`mt-2 ${classes.textSecondary}`}>Bra jobbat! Inga ärenden kräver åtgärd.</p>
                    </div>
                ) : (
                    actionItems.map(q => (
                        <div key={q.id} onClick={() => onSelect(q)} className={`p-2 rounded-md ${classes.inputBg} hover:bg-cyan-500/10 cursor-pointer transition-colors ${focusClasses}`}>
                            <p className="font-semibold text-sm">{q.kundNamn || q.customer}</p>
                            <p className={`text-xs ${classes.textSecondary}`}>Status: {statusTextMap[q.status] || q.status}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActionableQuotesWidget;
