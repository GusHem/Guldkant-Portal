import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';

export const Input = React.forwardRef(({ label, error, ...props }, ref) => {
    const { classes } = useContext(ThemeContext);
    return (
        <div>
            {label && <label className={`${classes.textSecondary} text-xs block mb-1`}>{label}</label>}
            <input
                ref={ref}
                {...props}
                className={`w-full p-2 rounded ${classes.inputBg} ${classes.text} border ${error ? 'border-red-500' : classes.border} transition-colors shadow-sm ${focusClasses}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
});

export const NumberInput = React.memo(({ label, error, name, value, onChange, onBlur, ...props }) => {
    const { classes } = useContext(ThemeContext);
    return (
        <div>
            {label && <label className={`${classes.textSecondary} text-xs block mb-1`}>{label}</label>}
            <input
                {...props}
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full p-2 rounded ${classes.inputBg} ${classes.text} border ${error ? 'border-red-500' : classes.border} transition-colors shadow-sm ${focusClasses}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
});

export const Textarea = React.forwardRef(({ label, ...props }, ref) => {
    const { classes } = useContext(ThemeContext);
    return (
        <div>
            {label && <label className={`${classes.textSecondary} text-xs block mb-1`}>{label}</label>}
            <textarea
                ref={ref}
                {...props}
                rows="3"
                className={`w-full p-2 rounded ${classes.inputBg} ${classes.text} border ${classes.border} transition-colors shadow-sm ${focusClasses}`}
            />
        </div>
    );
});

export const Checkbox = ({ label, ...props }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <input type="checkbox" {...props} className={`h-4 w-4 rounded bg-gray-500 border-gray-400 text-cyan-500 focus:ring-cyan-600 ${focusClasses}`} />
        <span>{label}</span>
    </label>
);