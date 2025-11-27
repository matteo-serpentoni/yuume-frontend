import { motion } from "framer-motion";

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
        padding: "8px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#1f2937",
            marginBottom: 2,
          }}
        >
          {item.title}
        </div>
        {item.variantTitle && item.variantTitle !== "Default Title" && (
          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            {item.variantTitle}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          x{item.quantity}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
            minWidth: 60,
            textAlign: "right",
          }}
        >
          {item.price}
        </div>
      </div>
    </motion.div>
  );
};

const OrderCard = ({ order, index }) => {
  const { id, orderNumber, status, createdAt, total, items = [] } = order;

  // Status colors
  const getStatusColor = (statusType, statusValue) => {
    if (statusType === "financial") {
      switch (statusValue) {
        case "PAID":
          return "#059669";
        case "PENDING":
          return "#d97706";
        case "REFUNDED":
          return "#dc2626";
        default:
          return "#6b7280";
      }
    }
    if (statusType === "fulfillment") {
      switch (statusValue) {
        case "FULFILLED":
          return "#059669";
        case "UNFULFILLED":
          return "#d97706";
        case "PARTIALLY_FULFILLED":
          return "#2563eb";
        default:
          return "#6b7280";
      }
    }
    return "#6b7280";
  };

  const getStatusLabel = (statusValue) => {
    const labels = {
      // Financial
      PAID: "Pagato",
      PENDING: "In attesa",
      REFUNDED: "Rimborsato",
      // Fulfillment
      FULFILLED: "Spedito",
      UNFULFILLED: "Da spedire",
      PARTIALLY_FULFILLED: "Parzialmente spedito",
    };
    return labels[statusValue] || statusValue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        borderRadius: 12,
        background: "#ffffff",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      {/* Order Header */}
      <div
        style={{
          padding: "16px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Ordine {orderNumber}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#059669",
            }}
          >
            {total}
          </div>
        </div>

        {/* Status Badges */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: `${getStatusColor("financial", status.financial)}15`,
              color: getStatusColor("financial", status.financial),
              border: `1px solid ${getStatusColor(
                "financial",
                status.financial
              )}30`,
            }}
          >
            💳 {getStatusLabel(status.financial)}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: `${getStatusColor(
                "fulfillment",
                status.fulfillment
              )}15`,
              color: getStatusColor("fulfillment", status.fulfillment),
              border: `1px solid ${getStatusColor(
                "fulfillment",
                status.fulfillment
              )}30`,
            }}
          >
            📦 {getStatusLabel(status.fulfillment)}
          </div>
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>📅</span> {createdAt}
        </div>
      </div>

      {/* Order Items */}
      <div
        style={{
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9ca3af",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          ARTICOLI ({items.length})
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {items.map((item, idx) => (
            <OrderItemRow key={item.id || idx} item={item} index={idx} />
          ))}
        </div>

        {/* Order ID */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid #f3f4f6",
            fontSize: 11,
            color: "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          ID: {id}
        </div>
      </div>
    </motion.div>
  );
};

const OrderCards = ({ message }) => {
  const { orders = [], title, message: displayMessage, total_count } = message;

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div style={{ color: "white", padding: 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            paddingBottom: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>📦</span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>
            {title || "Ordini"}
          </span>
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 14,
          }}
        >
          {displayMessage || "Nessun ordine trovato."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minWidth: "240px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📦</span>
          <span style={{ fontWeight: 600, fontSize: 16, color: "white" }}>
            {title || "I tuoi ordini"}
          </span>
        </div>
        {total_count && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {orders.length} di {total_count}
          </span>
        )}
      </div>

      {/* Display Message */}
      {displayMessage && (
        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {displayMessage}
        </div>
      )}

      {/* Order Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {orders.map((order, index) => (
          <OrderCard key={order.id || index} order={order} index={index} />
        ))}
      </div>
    </div>
  );
};

export default OrderCards;
