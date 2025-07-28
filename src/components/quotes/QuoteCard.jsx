import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate, statusColors } from '../../utils/helpers';
import StatusSelector from './StatusSelector.jsx';

const QuoteCard = React.forwardRef(({ quote, onSelect, isSelected, onStatusChange }, ref) => {
    // ========================================================================
    // 🕵️‍♂️ NY DIAGNOSTIK HÄR 🕵️‍♂️
    // Denna logg körs för varje kort och visar exakt vilka fält som kommer fram.
    console.log(`[DIAGNOSTIK I QUOTECARD för ${quote.id}] Fält som kom fram:`, Object.keys(quote));
    // ========================================================================
    
    // 🔍 CRITICAL DEBUG: Log every quote that tries to render (Din befintliga logg)
    console.log('🔍 QuoteCard rendering quote:', quote.kundNamn, quote.id, quote);
    
    const { classes } = useContext(ThemeContext);
    const statusBorderColor = {
        utkast: 'border-l-yellow-500',
        'förslag-skickat': 'border-l-blue-500',
        godkänd: 'border-l-green-500',
        genomförd: 'border-l-blue-700',
        betald: 'border-l-purple-500',
        förlorad: 'border-l-red-500',
        arkiverad: 'border-l-gray-500'
    };

    // 🔧 CRITICAL FIX: Map N8N field names to display values (Din befintliga kod)
    const customerName = quote.kundNamn || quote.customer || 'Namnlös kund';
    const eventDate = quote.eventDatum || quote.eventDate || '';
    const totalPrice = quote.totalPris || quote.total || 0;

    // 🔍 DEBUG: Log processed values (Din befintliga logg)
    console.log('🔧 Processed values:', { customerName, eventDate, totalPrice });

    return (
        <div
            ref={ref}
            tabIndex="0"
            className={`${classes.cardBg} rounded-lg shadow-lg p-5 border ${classes.border} ${statusBorderColor[quote.status] || 'border-l-gray-700'} border-l-4 transition-all duration-300 flex flex-col justify-between hover:ring-2 hover:scale-[1.02] ${isSelected ? 'ring-2 ring-cyan-500' : 'focus-within:ring-2 focus-within:ring-cyan-500/50'} ${focusClasses}`}
            onClick={() => onSelect(quote)}
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg pr-2 flex-grow">{customerName}</h3>
                </div>
                <div className="w-full">
                    <StatusSelector quote={quote} onStatusChange={onStatusChange} />
                </div>
            </div>
            <div className={`mt-4 pt-4 border-t border-dashed ${classes.border}`}>
                <div className="flex justify-between items-end">
                    <div>
                        <p className={`${classes.textSecondary} text-xs`}>Eventdatum</p>
                        <p className="font-medium">{formatDate(eventDate)}</p>
                    </div>
                    <div>
                        <p className={`${classes.textSecondary} text-xs text-right`}>Totalt</p>
                        <p className={`font-bold text-xl ${classes.accent}`}>
                            {totalPrice?.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default QuoteCard;
