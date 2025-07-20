// FILNAMN: src/contexts/ThemeContext.jsx
import React, { createContext } from 'react';

export const ThemeContext = createContext();

export const themes = {
    dark: { bg: 'bg-gray-900', cardBg: 'bg-gray-800', text: 'text-gray-200', textSecondary: 'text-gray-400', accent: 'text-cyan-400', border: 'border-gray-700', inputBg: 'bg-gray-700', buttonPrimaryBg: 'bg-cyan-500', buttonPrimaryText: 'text-gray-900', buttonPrimaryHover: 'hover:bg-cyan-400', buttonSecondaryBg: 'bg-gray-700', buttonSecondaryText: 'text-gray-200', buttonSecondaryHover: 'hover:bg-gray-600', modalOverlay: 'bg-black/80 backdrop-blur-md', navActive: 'bg-cyan-500/10 text-cyan-400 border-cyan-500', navInactive: 'text-gray-400 border-transparent hover:bg-gray-700/50', filterActive: 'bg-cyan-500 text-gray-900', filterInactive: 'bg-gray-700 hover:bg-gray-600', ringOffset: 'dark:ring-offset-gray-900' },
    light: { bg: 'bg-slate-50', cardBg: 'bg-white', text: 'text-slate-800', textSecondary: 'text-slate-500', accent: 'text-cyan-600', border: 'border-slate-200', inputBg: 'bg-slate-100', buttonPrimaryBg: 'bg-cyan-500', buttonPrimaryText: 'text-white', buttonPrimaryHover: 'hover:bg-cyan-600', buttonSecondaryBg: 'bg-slate-200', buttonSecondaryText: 'text-slate-800', buttonSecondaryHover: 'hover:bg-slate-300', modalOverlay: 'bg-slate-900/80 backdrop-blur-md', navActive: 'bg-cyan-500/10 text-cyan-600 border-cyan-500', navInactive: 'text-slate-600 border-transparent hover:bg-slate-200', filterActive: 'bg-cyan-500 text-white', filterInactive: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-200', ringOffset: 'ring-offset-slate-50' }
};

export const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-white dark:focus:ring-offset-gray-900';