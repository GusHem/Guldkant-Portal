import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import FileSearchIcon from '../icons/FileSearchIcon.jsx';

const EmptyState = ({ onNewQuote, error }) => {
    const { classes } = useContext(ThemeContext);
    return (
        <div className={`text-center p-12 border-2 border-dashed ${classes.border} rounded-xl mt-8 flex flex-col items-center`}>
            <FileSearchIcon className={`w-16 h-16 mb-4 ${classes.textSecondary}`} />
            <h3 className="text-xl font-bold">{error ? 'Ett fel uppstod' : 'Inga ärenden hittades'}</h3>
            <p className={`${classes.textSecondary} mb-6 max-w-sm`}>
                {error
                    ? `Kunde inte hämta data från servern: ${error}`
                    : 'Din sökning eller ditt filter gav inga resultat. Prova att ändra dina sökkriterier eller skapa ett nytt ärende.'
                }
            </p>
            <button
                onClick={onNewQuote}
                className={`${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm ${focusClasses}`}
            >
                Skapa Nytt Ärende
            </button>
        </div>
    );
};

export default EmptyState;