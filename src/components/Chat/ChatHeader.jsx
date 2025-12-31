import React from "react";
import "../Orb/Orb.css";

/**
 * ChatHeader
 * Unified header component used in both Chat and ChatPreview.
 */
const ChatHeader = () => {
  return (
    <div className="chat-mobile-header">
      <div className="header-content">
        <h3>Yuume</h3>
        <div className="online-status">
          <span className="status-dot"></span>
          <span className="status-text">Online</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
