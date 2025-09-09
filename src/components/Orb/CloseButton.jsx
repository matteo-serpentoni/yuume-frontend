// CloseButton.js
import React from 'react';
import './CloseButton.css';

const CloseButton = ({ onClick }) => {
    return (
        <button className="close-button" onClick={onClick}>
            <div className="close-x">
                <div className="close-line close-line-1"></div>
                <div className="close-line close-line-2"></div>
            </div>
            <div className="close-button-ring"></div>
        </button>
    );
};

export default CloseButton;