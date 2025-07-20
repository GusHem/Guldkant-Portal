import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import GuldkantLogo from '../common/GuldkantLogo.jsx';
import InteractiveNordSymLogo from '../common/InteractiveNordSymLogo.jsx';

const Header = ({ onToggleTheme, theme, onOpenHub }) => {
    const { classes } = useContext(ThemeContext);
    return (
        <header className={`p-4 flex justify-between items-center ${classes.border} border-b`}>
            <div>
                <GuldkantLogo className={classes.text} size="h-14" />
                <div className="relative flex items-center gap-2 opacity-70 mt-2">
                    <InteractiveNordSymLogo onOpenHub={onOpenHub} />
                </div>
            </div>
            <button onClick={onToggleTheme} className={`p-3 rounded-full ${classes.buttonSecondaryBg} ${classes.buttonSecondaryHover} transition-colors ${focusClasses}`}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </header>
    );
};

export default Header;