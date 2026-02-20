import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { getOrderStatusClass, normalizeOrderNumber } from '../../utils/shopifyUtils';
import './OrderCards.css';

const OrderItemRow = memo(({ item, index, theme = 'dark' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`yuume-order-item-row ${theme}`}
    >
      <div className="yuume-order-item-info">
        <div className="yuume-order-item-title">{item.title}</div>
        {item.variantTitle && item.variantTitle !== 'Default Title' && (
          <div className="yuume-order-item-variant">{item.variantTitle}</div>
        )}
      </div>
      <div className="yuume-order-item-right">
        <div className="yuume-order-item-quantity">x{item.quantity}</div>
        <div className="yuume-order-item-price">{item.price}</div>
      </div>
    </motion.div>
  );
});

// Detail view for a single order
export const OrderDetailCard = memo(({ order, theme = 'dark' }) => {
  const { orderNumber, status, createdAt, total, items = [], tracking = [] } = order;

  const getStatusClass = (statusValue) => {
    return getOrderStatusClass(statusValue);
  };

  const statusLabel = status?.fulfillment || status;
  const paymentLabel = status?.financial;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`yuume-order-detail-card ${theme}`}
    >
      {/* Header */}
      <div className="yuume-order-detail-header">
        <div className="yuume-order-detail-header-top">
          <div>
            <h4 className="yuume-order-number">{`#${normalizeOrderNumber(orderNumber)}`}</h4>
            <p className="yuume-order-date">{createdAt}</p>
          </div>
          <div className="yuume-order-total-large">{total}</div>
        </div>

        <div className="yuume-order-badges">
          {paymentLabel && (
            <span className={`yuume-status-badge ${getStatusClass(paymentLabel)}`}>
              💳 {paymentLabel}
            </span>
          )}
          <span className={`yuume-status-badge ${getStatusClass(statusLabel)}`}>
            📦 {statusLabel}
          </span>
          {tracking.length > 0 && (
            <a
              href={tracking[0].url}
              target="_blank"
              rel="noreferrer"
              className="yuume-tracking-link"
            >
              🚀 Traccia pacco
            </a>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="yuume-order-detail-items-container">
        <p className="yuume-order-items-label">ARTICOLI ({items.length})</p>
        <div>
          {items.map((item, idx) => (
            <OrderItemRow key={idx} item={item} index={idx} theme={theme} />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

// Summary row for list view
const OrderListRow = memo(({ order, index, onClick }) => {
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={isClickable ? () => onClick(order) : undefined}
      className={`yuume-order-list-row ${isClickable ? 'clickable' : ''}`}
      whileHover={
        isClickable
          ? {
              background: 'rgba(255, 255, 255, 0.08)',
              scale: 1.01,
            }
          : {}
      }
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      <div className="yuume-order-list-row-info">
        <div className="yuume-order-row-top">
          <span className="yuume-order-row-number">
            {order.orderNumber ? `#${normalizeOrderNumber(order.orderNumber)}` : order.createdAt}
          </span>
          {order.orderNumber && <span className="yuume-order-row-date">• {order.createdAt}</span>}
        </div>
        <div className="yuume-order-row-status">
          {typeof order.status === 'object'
            ? order.status.fulfillment || 'In elaborazione'
            : order.status}
        </div>
      </div>
      <div className="yuume-order-row-right">
        {order.total && <div className="yuume-order-row-total">{order.total}</div>}
        {isClickable && <div className="yuume-order-row-details-arrow">Dettagli →</div>}
      </div>
    </motion.div>
  );
});

const OrderCards = memo(({ message, onOrderClick }) => {
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
  const type = (directType || data.type || '').toLowerCase();

  // 1. Single Order Detail View
  if (
    type.includes('order_detail') ||
    (type.includes('order_cards') && orders.length === 1) ||
    (!orders.length && order)
  ) {
    const targetOrder = order || orders[0];
    if (!targetOrder) return null;

    const isClickable = !!targetOrder.orderNumber;

    return (
      <div className="yuume-order-cards-container">
        {finalDisplayMessage && <p className="yuume-order-detail-message">{finalDisplayMessage}</p>}
        <OrderListRow
          order={targetOrder}
          index={0}
          onClick={isClickable && onOrderClick ? () => onOrderClick(targetOrder, email) : null}
        />
      </div>
    );
  }

  // 2. Order List View (Minimal summaries, NOT clickable)
  return (
    <div className="yuume-order-cards-container">
      <div className="yuume-order-list-header">
        <div className="yuume-order-list-icon">📦</div>
        <div>
          <h4 className="yuume-order-list-title">{title || 'I tuoi ordini'}</h4>
          {email && <p className="yuume-order-list-email">{email}</p>}
        </div>
      </div>

      {finalDisplayMessage && (
        <p className="yuume-order-list-message">
          {String(finalDisplayMessage).replace('1 ordini', '1 ordine')}
        </p>
      )}

      <div className="yuume-order-list-items">
        {orders.map((o, idx) => (
          <OrderListRow key={o.id || idx} order={o} index={idx} />
        ))}
      </div>
    </div>
  );
});

export default OrderCards;
