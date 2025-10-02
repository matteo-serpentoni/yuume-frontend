import { motion } from "framer-motion";
import MessageChips from "./MessageChips";

const OrderItemRow = ({ item, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid #f3f4f6"
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#111827",
                    marginBottom: 2
                }}>
                    {item.title}
                </div>
                {item.variantTitle && item.variantTitle !== "Default Title" && (
                    <div style={{
                        fontSize: 11,
                        color: "#6b7280"
                    }}>
                        {item.variantTitle}
                    </div>
                )}
            </div>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12
            }}>
                <div style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 500
                }}>
                    x{item.quantity}
                </div>
                <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                    minWidth: 60,
                    textAlign: "right"
                }}>
                    {item.price}
                </div>
            </div>
        </motion.div>
    );
};

const OrderCard = ({ order, index }) => {
    const {
        id,
        orderNumber,
        status,
        createdAt,
        total,
        currency,
        items = [],
        itemCount,
        hasFulfillments
    } = order;

    // Status colors
    const getStatusColor = (statusType, statusValue) => {
        if (statusType === "financial") {
            switch (statusValue) {
                case "PAID": return "#059669";
                case "PENDING": return "#f59e0b";
                case "REFUNDED": return "#dc2626";
                default: return "#6b7280";
            }
        }
        if (statusType === "fulfillment") {
            switch (statusValue) {
                case "FULFILLED": return "#059669";
                case "UNFULFILLED": return "#f59e0b";
                case "PARTIALLY_FULFILLED": return "#3b82f6";
                default: return "#6b7280";
            }
        }
        return "#6b7280";
    };

    const getStatusLabel = (statusValue) => {
        const labels = {
            // Financial
            "PAID": "Pagato",
            "PENDING": "In attesa",
            "REFUNDED": "Rimborsato",
            // Fulfillment
            "FULFILLED": "Spedito",
            "UNFULFILLED": "Da spedire",
            "PARTIALLY_FULFILLED": "Parzialmente spedito"
        };
        return labels[statusValue] || statusValue;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden",
                transition: "all 0.2s ease"
            }}
            whileHover={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)"
            }}
        >
            {/* Order Header */}
            <div style={{
                padding: 12,
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6
                }}>
                    <div style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827"
                    }}>
                        Ordine {orderNumber}
                    </div>
                    <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#059669"
                    }}>
                        {total}
                    </div>
                </div>

                {/* Status Badges */}
                <div style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap"
                }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        background: `${getStatusColor("financial", status.financial)}15`,
                        color: getStatusColor("financial", status.financial)
                    }}>
                        💳 {getStatusLabel(status.financial)}
                    </div>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        background: `${getStatusColor("fulfillment", status.fulfillment)}15`,
                        color: getStatusColor("fulfillment", status.fulfillment)
                    }}>
                        📦 {getStatusLabel(status.fulfillment)}
                    </div>
                </div>

                {/* Date */}
                <div style={{
                    fontSize: 11,
                    color: "#6b7280",
                    marginTop: 6
                }}>
                    📅 {createdAt}
                </div>
            </div>

            {/* Order Items */}
            <div style={{
                padding: 12
            }}>
                <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                }}>
                    Articoli ({itemCount})
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    {items.map((item, idx) => (
                        <OrderItemRow
                            key={item.id || idx}
                            item={item}
                            index={idx}
                        />
                    ))}
                </div>

                {/* Order ID */}
                <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid #f3f4f6",
                    fontSize: 10,
                    color: "#9ca3af"
                }}>
                    ID: {id}
                </div>
            </div>
        </motion.div>
    );
};

const OrderCards = ({ message, onChipClick }) => {
    const { orders = [], title, message: displayMessage, total_count } = message;

    if (!Array.isArray(orders) || orders.length === 0) {
        return (
            <>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8
                }}>
                    <span>📦</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {title || "Ordini"}
                    </span>
                </div>
                <div style={{
                    color: "#6b7280",
                    fontSize: 12,
                    marginBottom: 12
                }}>
                    {displayMessage || "Nessun ordine trovato."}
                </div>
                <MessageChips chips={message.chips} onChipClick={onChipClick} />
            </>
        );
    }

    return (
        <>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: "1px solid #f3f4f6"
            }}>
                <span style={{ fontSize: 16 }}>📦</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {title || `${orders.length} ordine${orders.length > 1 ? "i" : ""} trovato${orders.length > 1 ? "i" : ""}`}
                </span>
                {total_count && total_count !== orders.length && (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                        (di {total_count} totali)
                    </span>
                )}
            </div>

            {/* Display Message */}
            {displayMessage && (
                <div style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 12,
                    lineHeight: 1.4
                }}>
                    {displayMessage}
                </div>
            )}

            {/* Order Cards */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12
            }}>
                {orders.map((order, index) => (
                    <OrderCard
                        key={order.id || index}
                        order={order}
                        index={index}
                    />
                ))}
            </div>

            <MessageChips chips={message.chips} onChipClick={onChipClick} />
        </>
    );
};

export default OrderCards;