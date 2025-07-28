import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

const AnalyticsSummaryCard = ({ title, value, unit, icon }) => {
    const { classes } = useContext(ThemeContext);
    return (
        <div className={`${classes.cardBg} p-4 rounded-lg shadow-md flex items-center gap-4 border-2 border-cyan-500/30 group transition-all duration-300 hover:shadow-xl hover:border-cyan-500`}>
            <div className={`p-3 rounded-full ${classes.inputBg} transition-all duration-300`}>
                <div className={`text-2xl ${classes.textSecondary} transition-all duration-300 group-hover:scale-110 group-hover:${classes.accent}`}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className={`text-sm font-medium ${classes.textSecondary}`}>{title}</h3>
                <p className="text-2xl font-bold">{value} <span className="text-lg font-medium">{unit || ''}</span></p>
            </div>
        </div>
    );
};

export default AnalyticsSummaryCard;