import React from 'react';

const GuldkantLogo = ({ className, size = 'h-16' }) => (
    <div className={`flex items-center gap-4 ${className}`}>
        <img src="https://raw.githubusercontent.com/NordSync/Guldkant-Logga/refs/heads/main/Guldkant%20logga.svg" alt="Guldkant Logotyp" className={size} />
        <span className="text-3xl font-bold">Guldkant Portalen</span>
    </div>
);

export default GuldkantLogo;