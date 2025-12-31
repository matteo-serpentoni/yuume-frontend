import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import "./OrderLookupForm.css";

/**
 * OrderLookupForm Component
 *
 * A sleek, glassmorphism form for tracking orders.
 * Follows the "Ethereal" design system.
 */
const OrderLookupForm = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    // Format: "ORDER_LOOKUP:email:#orderNumber" or just "ORDER_LOOKUP:email"
    const lookupString = orderNumber
      ? `ORDER_LOOKUP:${email}:${orderNumber}`
      : `ORDER_LOOKUP:${email}`;

    onSubmit(lookupString);
  };

  return (
    <motion.div
      className="yuume-order-lookup-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="yuume-order-form-header">
        <span className="yuume-order-form-icon">📦</span>
        <h3 className="yuume-order-form-title">Traccia il tuo ordine</h3>
      </div>

      <form onSubmit={handleSubmit} className="yuume-order-form-body">
        <div className="yuume-form-group">
          <label htmlFor="order-email">Email acquistata</label>
          <input
            id="order-email"
            type="email"
            placeholder="mario@esempio.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="yuume-form-group">
          <label htmlFor="order-number">Numero ordine (opzionale)</label>
          <input
            id="order-number"
            type="text"
            placeholder="es. #1234"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="yuume-order-form-submit"
          disabled={!email || isLoading}
        >
          {isLoading ? <span className="yuume-loader-small" /> : "Cerca ordine"}
        </button>
      </form>
    </motion.div>
  );
};

export default OrderLookupForm;
