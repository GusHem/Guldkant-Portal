import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import InfoIcon from '../icons/InfoIcon.jsx';

const InteractiveNordSymLogo = ({ onOpenHub }) => {
    const { classes } = useContext(ThemeContext);
    return (
        <div className="relative group flex items-center gap-2 cursor-pointer" onClick={onOpenHub}>
            <span className="text-xs text-gray-400 select-none">Powered by</span>
            <div className="relative h-8 w-8">
                <img src="https://raw.githubusercontent.com/NordSync/Logga-minus-text/refs/heads/main/Final%20logo%20no%20text.svg" alt="NordSym Logo" className="w-full h-full rounded-full transition-all duration-300 ease-in-out group-hover:scale-[3.5] group-hover:z-20 group-hover:bg-white/20 dark:group-hover:bg-gray-900/50 group-hover:backdrop-blur-sm group-hover:p-1 group-hover:shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                    <InfoIcon className={`w-4 h-4 ${classes.accent} drop-shadow-lg`} />
                </div>
            </div>
        </div>
    );
};

export default InteractiveNordSymLogo;