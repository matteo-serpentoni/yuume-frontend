import TextMessage from "./TextMessage";
import ProductCards from "./ProductCards";
import OrderCards from "./OrderCards";

const MessageRenderer = ({ message, onChipClick, shopDomain }) => {
    console.log('🟡 MessageRenderer - shopDomain:', shopDomain);
    console.log('🟡 MessageRenderer - message.type:', message.type);
    console.log('🟡 MessageRenderer - message.sender:', message.sender);

    if (message.sender === "user") {
        return (
            <div style={{ lineHeight: 1.5 }}>
                {message.text}
            </div>
        );
    }

    // Assistant messages - gestisci i tre tipi
    switch (message.type) {
        case "product_cards":
            console.log('🟡 PRIMA di passare a ProductCards - shopDomain:', shopDomain);
            return <ProductCards message={message} onChipClick={onChipClick} shopDomain={shopDomain} />;
        case "order_cards":
            return <OrderCards message={message} onChipClick={onChipClick} />;
        case "text":
        default:
            return <TextMessage message={message} onChipClick={onChipClick} />;
    }
};

export default MessageRenderer;