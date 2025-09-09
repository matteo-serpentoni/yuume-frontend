import React from "react";
import TextMessage from "./TextMessage";
import ProductCards from "./ProductCards";

const MessageRenderer = ({ message, onChipClick }) => {
    if (message.sender === "user") {
        return (
            <div style={{ lineHeight: 1.5 }}>
                {message.text}
            </div>
        );
    }

    // Assistant messages - gestisci i nuovi tipi
    switch (message.type) {
        case "product_cards":
            return <ProductCards message={message} onChipClick={onChipClick} />;

        case "text":
        default:
            return <TextMessage message={message} onChipClick={onChipClick} />;
    }
};

export default MessageRenderer;