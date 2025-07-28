import React from 'react';

const Toast = ({ toast, onUndo }) => {
    if (!toast) return null;

    return (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} flex items-center gap-4`}>
            <span>{toast.message}</span>
            {toast.undoable && (
                <button onClick={onUndo} className="font-bold underline hover:text-gray-200">
                    Ångra
                </button>
            )}
        </div>
    );
};

export default Toast;