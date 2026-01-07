import React from "react";
import "./ChatHeader.css";

/**
 * ChatHeader
 * Unified header component used in both Chat and ChatPreview.
 */
const ChatHeader = ({ connectionStatus = "online" }) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "offline":
        return { text: "OFFLINE", class: "status-offline" };
      case "reconnecting":
        return { text: "RECONNECTING", class: "status-reconnecting" };
      case "online":
      default:
        return { text: "ONLINE", class: "status-online" };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="chat-mobile-header">
      <div className="header-content">
        <h3>Yuume</h3>
        <div className="online-status">
          <span className={`status-dot ${config.class}`}></span>
          <span className="status-text">{config.text}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
