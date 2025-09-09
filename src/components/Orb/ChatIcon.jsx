// ChatIcon.js - Componente da usare nell'orb
import React from 'react';
import './ChatIcon.css';

const ChatIcon = ({ onClick }) => {
    return (
        <div className="chat-icon-container" onClick={onClick}>
            <div className="chat-bubble-icon">
                <div className="typing-dots">
                    <div className="dot dot-1"></div>
                    <div className="dot dot-2"></div>
                    <div className="dot dot-3"></div>
                </div>
            </div>
            <div className="pulse-ring"></div>
        </div>
    );
};

export default ChatIcon;