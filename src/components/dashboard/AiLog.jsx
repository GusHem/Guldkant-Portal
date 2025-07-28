import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

// This is a placeholder component as requested.
const AiLog = () => {
    const { classes } = useContext(ThemeContext);
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">AI-Logg</h1>
            <p className={classes.textSecondary}>Denna sektion är under utveckling.</p>
        </div>
    );
};

export default AiLog;