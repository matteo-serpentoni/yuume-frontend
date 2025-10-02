import TextMessage from "./TextMessage";
import ProductCards from "./ProductCards";
import OrderCards from "./OrderCards";

const MessageRenderer = ({ message, onChipClick }) => {
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
            return <ProductCards message={message} onChipClick={onChipClick} />;

        case "order_cards":
            return <OrderCards message={message} onChipClick={onChipClick} />;

        case "text":
        default:
            return <TextMessage message={message} onChipClick={onChipClick} />;
    }
};

export default MessageRenderer;