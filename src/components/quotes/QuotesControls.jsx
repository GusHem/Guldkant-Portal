import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';

const QuotesControls = ({ onFilterChange, onSearch, onNewQuote, activeFilter, searchRef, viewMode, setViewMode, summary }) => {
    const { classes } = useContext(ThemeContext);
    const filters = ["Alla", "Utkast", "Förslag Skickat", "Godkänd", "Genomförd", "Arkiv"];

    return (
        <div className="mb-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Sök på kundnamn, ID..."
                    onChange={e => onSearch(e.target.value)}
                    className={`w-full md:w-2/5 p-2 rounded ${classes.inputBg} ${classes.text} border ${classes.border} transition-colors shadow-sm ${focusClasses}`}
                />
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('cards')} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${focusClasses} ${viewMode === 'cards' ? classes.filterActive : classes.filterInactive}`}>Kortvy</button>
                    <button onClick={() => setViewMode('calendar')} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${focusClasses} ${viewMode === 'calendar' ? classes.filterActive : classes.filterInactive}`}>Kalendervy</button>
                    <button onClick={onNewQuote} className={`${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm ${focusClasses}`}>Nytt Ärende</button>
                </div>
            </div>
            <div className={`p-3 mb-4 rounded-lg border ${classes.border} ${classes.inputBg}`}>
                <p className="text-sm font-semibold">{summary.text}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.map(f =>
                    <button
                        key={f}
                        onClick={() => onFilterChange(f.toLowerCase().replace(' ', '-'))}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${focusClasses} ${activeFilter === f.toLowerCase().replace(' ', '-') ? classes.filterActive : classes.filterInactive}`}
                    >
                        {f}
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuotesControls;