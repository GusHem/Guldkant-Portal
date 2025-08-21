// 🚀 GULDKANT QUANTUM PAGINATION UI FIX
// Filnamn: src/components/dashboard/QuotesDashboard.jsx
// Final MVP Fix - implementerar UI för "Ladda fler"-funktionalitet.

import React, { useContext, useMemo, useState, useRef } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { statusTextMap } from '../../utils/helpers';
import ActionableQuotesWidget from './ActionableQuotesWidget.jsx';
import FollowUpWidget from './FollowUpWidget.jsx';
import UpcomingEventsWidget from './UpcomingEventsWidget.jsx';
import AnalyticsSummaryCard from './AnalyticsSummaryCard.jsx';
import ChartLineUpIcon from '../icons/ChartLineUpIcon.jsx';
import DivideIcon from '../icons/DivideIcon.jsx';
import BriefcaseIcon from '../icons/BriefcaseIcon.jsx';
import SquareIcon from '../icons/SquareIcon.jsx';
import XIcon from '../icons/XIcon.jsx';
import EmptyState from '../common/EmptyState.jsx';
import QuotesControls from '../quotes/QuotesControls.jsx';
import QuoteCard from '../quotes/QuoteCard.jsx';
import QuoteCardSkeleton from '../quotes/QuoteCardSkeleton.jsx';
import TactileCalendar from '../calendar/TactileCalendar.jsx';

const QuotesDashboard = ({ 
    allQuotes, 
    displayQuotes, 
    isLoading, 
    onSelectQuote, 
    onNewQuote, 
    onFilterChange, 
    onSearch, 
    activeFilter, 
    searchRef, 
    onStatusChange, 
    fetchError,
    // ✅ NYA PROPS FÖR PAGINERING
    hasMore,
    isFetchingMore,
    onLoadMore
}) => {
    const { classes } = useContext(ThemeContext);
    const [viewMode, setViewMode] = useState('cards');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const cardRefs = useRef({});

    const analytics = useMemo(() => {
        // ✅ CRITICAL FIX: Aligned filtering logic with App.jsx to ensure consistency.
        // This is now the single source of truth for "active" status within this component.
        const aktivaStatus = ['utkast', 'förslag-skickat', 'godkänd', 'genomförd', 'betald'];
        const activeQuotes = allQuotes.filter(q => aktivaStatus.includes(q.status));
        
        const totalValue = activeQuotes.reduce((sum, q) => sum + (q.totalPris || 0), 0);
        return {
            totalQuoteValue: totalValue,
            averageQuoteValue: activeQuotes.length ? (totalValue / activeQuotes.length) : 0,
            activeQuotesCount: activeQuotes.length,
        };
    }, [allQuotes]);

    const filterSummary = useMemo(() => {
        const count = displayQuotes.length;
        if (count === 0 && !fetchError) return { text: "Inga ärenden i denna vy." };
        if (fetchError) return { text: "Kunde inte ladda ärenden." };
        const totalValue = displayQuotes.reduce((sum, q) => sum + (q.totalPris || 0), 0);
        const filterText = statusTextMap[activeFilter] || activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
        const plural = count === 1 ? 'ärende' : 'ärenden';
        return { text: `Visar ${count} ${filterText === 'Alla' ? 'aktiva ' : ''}${plural} med ett totalt värde av ${totalValue.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}.` };
    }, [displayQuotes, activeFilter, fetchError]);

    const handleContainerKeyDown = (e) => {
        const focusableElements = Object.values(cardRefs.current).filter(el => el);
        if (document.activeElement && focusableElements.includes(document.activeElement)) {
            const currentIndex = focusableElements.indexOf(document.activeElement);
            let nextIndex = -1;
            if (e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % focusableElements.length;
            } else if (e.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            }
            if (nextIndex !== -1) {
                e.preventDefault();
                focusableElements[nextIndex].focus();
            }
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button onClick={() => setIsFocusMode(!isFocusMode)} className={`${classes.buttonSecondaryBg} ${classes.buttonSecondaryHover} p-2 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10 ${isFocusMode ? 'ring-2 ring-cyan-500' : ''} ${focusClasses}`} title={isFocusMode ? "Avsluta fokusläge" : "Fokusläge"}>
                    {isFocusMode ? <XIcon className={`${classes.accent} w-1.2 h-1.2`} /> : <SquareIcon className={classes.accent} />}
                </button>
            </div>
            <p className={`${classes.textSecondary} mb-8`}>En proaktiv översikt av din cateringverksamhet.</p>

            <div className={`transition-all duration-500 ${isFocusMode ? 'max-h-0 opacity-0 overflow-hidden mb-0' : 'max-h-screen opacity-100 mb-8'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <ActionableQuotesWidget quotes={allQuotes} onSelect={onSelectQuote} />
                    </div>
                    <div className="lg:col-span-2 grid grid-rows-2 gap-6">
                        <UpcomingEventsWidget quotes={allQuotes} onSelect={onSelectQuote} />
                        <FollowUpWidget quotes={allQuotes} onSelect={onSelectQuote} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <AnalyticsSummaryCard title="Aktivt Värde (Inkl. moms)" value={analytics.totalQuoteValue.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })} icon={<ChartLineUpIcon />} />
                        <AnalyticsSummaryCard title="Snittvärde/Ärende" value={analytics.averageQuoteValue.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })} icon={<DivideIcon />} />
                        <AnalyticsSummaryCard title="Aktiva Ärenden" value={analytics.activeQuotesCount} icon={<BriefcaseIcon />} />
                    </div>
                </div>
            </div>

            <QuotesControls onFilterChange={onFilterChange} onSearch={onSearch} onNewQuote={onNewQuote} activeFilter={activeFilter} searchRef={searchRef} viewMode={viewMode} setViewMode={setViewMode} summary={filterSummary} />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {Array.from({ length: 8 }).map((_, i) => <QuoteCardSkeleton key={i} />)}
                </div>
            ) : fetchError ? (
                <EmptyState onNewQuote={onNewQuote} error={fetchError} />
            ) : displayQuotes.length > 0 ? (
                <>
                    {viewMode === 'cards' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10" onKeyDown={handleContainerKeyDown}>
                            {displayQuotes.map(quote => <QuoteCard key={quote.id} ref={el => cardRefs.current[quote.id] = el} quote={quote} onSelect={onSelectQuote} onStatusChange={onStatusChange} />)}
                        </div>
                    ) : (
                        <TactileCalendar quotes={displayQuotes} onSelect={onSelectQuote} />
                    )}

                    {/* ✅ NY UI FÖR PAGINERING */}
                    {hasMore && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={onLoadMore}
                                disabled={isFetchingMore}
                                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} ${focusClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isFetchingMore ? 'Laddar...' : 'Ladda fler offerter'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState onNewQuote={onNewQuote} />
            )}
        </div>
    );
};

export default QuotesDashboard;
