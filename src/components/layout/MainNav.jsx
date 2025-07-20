import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';

const MainNav = ({ activeView, setActiveView }) => {
    const { classes } = useContext(ThemeContext);
    const navItems = [
        { id: 'quotes', label: 'Offerter' },
        { id: 'ai', label: 'AI-Logg' },
        { id: 'analytics', label: 'Analytics' }
    ];

    return (
        <nav className={`px-4 md:px-8 pt-4 border-b ${classes.border}`}>
            <div className="flex flex-wrap gap-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${focusClasses} ${activeView === item.id ? classes.navActive : classes.navInactive}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default MainNav;