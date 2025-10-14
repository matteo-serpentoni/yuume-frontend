import TextMessage from "./TextMessage";
import ProductCards from "./ProductCards";
import OrderCards from "./OrderCards";
import SupportMessage from "./SupportMessage";

const MessageRenderer = ({ message, onChipClick, shopDomain, onSupportFeedback }) => {
    if (message.sender === "user") {
        return <div style={{ lineHeight: 1.5 }}>{message.text}</div>;
    }

    switch (message.type) {
        case "product_cards":
            return <ProductCards message={message} onChipClick={onChipClick} shopDomain={shopDomain} />;
        case "order_cards":
            return <OrderCards message={message} onChipClick={onChipClick} />;
        case "support":
            return <SupportMessage message={message} onFeedback={onSupportFeedback} />;
        case "text":
        default:
            return <TextMessage message={message} onChipClick={onChipClick} />;
    }
};

export default MessageRenderer;