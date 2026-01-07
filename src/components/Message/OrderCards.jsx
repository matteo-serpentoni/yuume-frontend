import { motion } from "framer-motion";

export const OrderItemRow = ({ item, index, theme = "dark" }) => {
  const isLight = theme === "light";
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
        borderBottom: `1px solid ${
          isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.03)"
        }`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isLight ? "#1e293b" : "#ffffff",
            marginBottom: 1,
          }}
        >
          {item.title}
        </div>
        {item.variantTitle && item.variantTitle !== "Default Title" && (
          <div
            style={{
              fontSize: 11,
              color: isLight ? "#64748b" : "rgba(255, 255, 255, 0.5)",
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
            fontSize: 11,
            color: isLight ? "#64748b" : "rgba(255, 255, 255, 0.6)",
            fontWeight: 500,
          }}
        >
          x{item.quantity}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isLight ? "#0f172a" : "#ffffff",
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

// Detail view for a single order
export const OrderDetailCard = ({ order, theme = "dark" }) => {
  const isLight = theme === "light";
  const {
    id,
    orderNumber,
    status,
    createdAt,
    total,
    items = [],
    tracking = [],
  } = order;

  const getStatusColor = (statusType, statusValue) => {
    const val = String(statusValue).toUpperCase();
    if (statusType === "financial") {
      switch (val) {
        case "PAID":
        case "PAGATO":
          return "#10b981";
        case "PENDING":
        case "IN SOSPESO":
        case "AUTORIZZATO":
        case "AUTHORIZED":
          return "#f59e0b";
        case "REFUNDED":
        case "RIMBORSATO":
        case "ANNULLATO":
        case "VOIDED":
          return "#ef4444";
        default:
          return "#94a3b8";
      }
    }
    if (statusType === "fulfillment") {
      switch (val) {
        case "FULFILLED":
        case "SPEDITO":
          return "#10b981";
        case "UNFULFILLED":
        case "IN PREPARAZIONE":
        case "IN LAVORAZIONE":
          return "#f59e0b";
        case "PARTIALLY_FULFILLED":
        case "PARZIALMENTE SPEDITO":
          return "#3b82f6";
        default:
          return "#94a3b8";
      }
    }
    return "#94a3b8";
  };

  const statusLabel = status?.fulfillment || status;
  const paymentLabel = status?.financial;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`yuume-order-detail-card ${theme}`}
      style={{
        borderRadius: 16,
        background: isLight ? "transparent" : "rgba(255, 255, 255, 0.06)",
        backdropFilter: isLight ? "none" : "blur(10px)",
        border: isLight ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        width: "100%",
        boxShadow: isLight ? "none" : "0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isLight ? "0 0 12px 0" : "12px 14px",
          borderBottom: `1px solid ${
            isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.03)"
          }`,
          background: isLight ? "transparent" : "rgba(255,255,255,0.01)",
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
          <div>
            <h4
              style={{
                margin: 0,
                color: isLight ? "#1e293b" : "white",
                fontWeight: 700,
              }}
            >
              {`#${String(orderNumber).replace(/^#+/, "")}`}
            </h4>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: isLight ? "#64748b" : "rgba(255,255,255,0.4)",
              }}
            >
              {createdAt}
            </p>
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: isLight ? "#0f172a" : "#ffffff",
            }}
          >
            {total}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {paymentLabel && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background: `${getStatusColor("financial", paymentLabel)}20`,
                color: getStatusColor("financial", paymentLabel),
                border: `1px solid ${getStatusColor(
                  "financial",
                  paymentLabel
                )}40`,
              }}
            >
              💳 {paymentLabel}
            </span>
          )}
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: `${getStatusColor("fulfillment", statusLabel)}20`,
              color: getStatusColor("fulfillment", statusLabel),
              border: `1px solid ${getStatusColor(
                "fulfillment",
                statusLabel
              )}40`,
            }}
          >
            📦 {statusLabel}
          </span>
          {tracking.length > 0 && (
            <a
              href={tracking[0].url}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(59, 130, 246, 0.1)",
                color: "#3b82f6",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
              }}
            >
              🚀 Traccia pacco
            </a>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: isLight ? "16px 0" : "12px 14px" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 10,
            fontWeight: 800,
            color: isLight ? "#64748b" : "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          ARTICOLI ({items.length})
        </p>
        <div>
          {items.map((item, idx) => (
            <OrderItemRow key={idx} item={item} index={idx} theme={theme} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Summary row for list view
const OrderListRow = ({ order, index, onClick }) => {
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={isClickable ? () => onClick(order) : undefined}
      style={{
        padding: "10px 12px",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        borderRadius: 10,
        cursor: isClickable ? "pointer" : "default",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      }}
      whileHover={
        isClickable
          ? {
              background: "rgba(255, 255, 255, 0.08)",
              scale: 1.01,
            }
          : {}
      }
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontWeight: 700,
              color: "white",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {order.orderNumber
              ? `#${String(order.orderNumber).replace(/^#+/, "")}`
              : order.createdAt}
          </span>
          {order.orderNumber && (
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                whiteSpace: "nowrap",
              }}
            >
              • {order.createdAt}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#10b981",
            marginTop: 2,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {typeof order.status === "object"
            ? order.status.fulfillment || "In elaborazione"
            : order.status}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {order.total && (
          <div
            style={{
              fontWeight: 700,
              color: "white",
              fontSize: 14,
              letterSpacing: "-0.01em",
            }}
          >
            {order.total}
          </div>
        )}
        {isClickable && (
          <div
            style={{
              fontSize: 9,
              color: "#3b82f6",
              marginTop: 1,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Dettagli →
          </div>
        )}
      </div>
    </motion.div>
  );
};

const OrderCards = ({ message, onOrderClick }) => {
  const {
    type: directType,
    orders: directOrders = [],
    order: directOrder,
    title: directTitle,
    message: directMessage,
    text: historicalText,
    email: directEmail,
    data = {},
  } = message;

  // Normalize data and type from potential history structure
  const orders = directOrders.length ? directOrders : data.orders || [];
  const order = directOrder || data.order;
  const title = directTitle || data.title;
  const email = directEmail || data.email;
  const finalDisplayMessage = directMessage || historicalText || data.message;
  const type = (directType || data.type || "").toLowerCase();

  // 1. Single Order Detail View
  // We show the detail/row view if:
  // - type is order_detail or its uppercase variant
  // - OR it's a list with exactly one order
  // - OR it contains a single 'order' object
  if (
    type.includes("order_detail") ||
    (type.includes("order_cards") && orders.length === 1) ||
    (!orders.length && order)
  ) {
    const targetOrder = order || orders[0];
    if (!targetOrder) return null;

    const isClickable = !!targetOrder.orderNumber;

    return (
      <div style={{ width: "100%", padding: "4px 0" }}>
        {finalDisplayMessage && (
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {finalDisplayMessage}
          </p>
        )}
        <OrderListRow
          order={targetOrder}
          index={0}
          onClick={
            isClickable && onOrderClick
              ? () => onOrderClick(targetOrder, email)
              : null
          }
        />
      </div>
    );
  }

  // 2. Order List View (Minimal summaries, NOT clickable)
  return (
    <div style={{ width: "100%", padding: "4px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          📦
        </div>
        <div>
          <h4 style={{ margin: 0, color: "white", fontSize: 14 }}>
            {title || "I tuoi ordini"}
          </h4>
          {email && (
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              {email}
            </p>
          )}
        </div>
      </div>

      {finalDisplayMessage && (
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 13,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          {String(finalDisplayMessage).replace("1 ordini", "1 ordine")}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {orders.map((o, idx) => (
          <OrderListRow key={o.id || idx} order={o} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default OrderCards;
