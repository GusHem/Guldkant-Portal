import React from 'react';

const ModalSection = ({ title, children, className = "" }) => {
  return (
    <div className={`modal-section ${className}`}>
      {title && <h3 className="modal-section-title">{title}</h3>}
      <div className="modal-section-content">
        {children}
      </div>
    </div>
  );
};

export default ModalSection;
