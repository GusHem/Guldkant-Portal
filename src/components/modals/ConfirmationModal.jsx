import React, { useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import AlertCircleIcon from '../icons/AlertCircleIcon.jsx';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmButtonClass = 'bg-red-600 text-white hover:bg-red-700' }) => {
    const { classes } = useContext(ThemeContext);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 ${classes.modalOverlay}`}>
            <div onClick={e => e.stopPropagation()} className={`${classes.cardBg} w-full max-w-md rounded-xl shadow-2xl p-6`}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-full flex-shrink-0">
                        <AlertCircleIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{title}</h3>
                        <p className={`mt-2 ${classes.textSecondary}`}>{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className={`${classes.buttonSecondaryBg} ${classes.buttonSecondaryText} ${classes.buttonSecondaryHover} px-5 py-2 rounded-lg font-semibold ${focusClasses}`}>
                        Avbryt
                    </button>
                    <button onClick={onConfirm} className={`${confirmButtonClass} px-5 py-2 rounded-lg font-semibold ${focusClasses}`}>
                        {confirmText || 'Bekräfta'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;