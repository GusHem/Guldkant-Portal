import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

// This is a placeholder component as requested.
const AnalyticsPlaceholder = () => {
    const { classes } = useContext(ThemeContext);
    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Analytics</h1>
            <p className={`${classes.textSecondary}`}>Denna sektion är under utveckling.</p>
        </div>
    );
}

export default AnalyticsPlaceholder;