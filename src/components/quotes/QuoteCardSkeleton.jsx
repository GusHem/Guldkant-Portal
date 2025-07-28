import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

const QuoteCardSkeleton = () => {
    const { classes } = useContext(ThemeContext);
    return (
        <div className={`rounded-lg p-5 border ${classes.border} ${classes.cardBg} animate-pulse`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`h-6 w-3/5 rounded ${classes.inputBg}`}></div>
                <div className={`h-6 w-1/4 rounded ${classes.inputBg}`}></div>
            </div>
            <div className={`h-4 w-1/3 rounded ${classes.inputBg} mb-6`}></div>
            <div className={`border-t ${classes.border} border-dashed pt-4 flex justify-between items-end`}>
                <div>
                    <div className={`h-4 w-20 rounded ${classes.inputBg} mb-1`}></div>
                    <div className={`h-5 w-24 rounded ${classes.inputBg}`}></div>
                </div>
                <div>
                    <div className={`h-4 w-12 rounded ${classes.inputBg} mb-1`}></div>
                    <div className={`h-6 w-28 rounded ${classes.inputBg}`}></div>
                </div>
            </div>
        </div>
    );
};

export default QuoteCardSkeleton;