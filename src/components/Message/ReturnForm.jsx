import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LookupResult from './LookupResult';
import './ReturnForm.css';

/**
 * ReturnForm Component
 *
 * A dedicated multi-step form for handling return requests.
 * Aligned with OrderLookupForm aesthetics (Glassmorphism / Ethereal).
 */
const ReturnForm = ({ message, onSubmit, loading }) => {
  const {
    formConfig,
    order,
    email: contextEmail,
    selectedItem: contextItem,
    reasons: contextReasons,
  } = message;
  const currentStep = formConfig?.step || 1;

  // Form State
  const [email, setEmail] = useState(contextEmail || '');
  const [orderNumber, setOrderNumber] = useState(order?.orderNumber || '');
  const [selectedItemId, setSelectedItemId] = useState(contextItem?.id ?? null);
  const [reasonId, setReasonId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorVisible, setErrorVisible] = useState(null);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Step 1 Submit: Verify Credentials
  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!email || !orderNumber) return;

    if (!validateEmail(email)) {
      setErrorVisible('Inserisci un indirizzo email valido.');
      return;
    }

    setErrorVisible(null);
    onSubmit(`RETURN_VERIFY:${email}:${orderNumber.replace(/^#+/, '')}`);
  };

  // Step 2 Submit: Select Item
  const handleStep2Submit = () => {
    if (selectedItemId === null) return;
    onSubmit(`RETURN_SELECT_ITEM:${email}:${orderNumber}:${selectedItemId}`);
  };

  // Step 3 Submit: Final Request
  const handleStep3Submit = () => {
    if (!reasonId) return;
    onSubmit(`RETURN_SUBMIT:${email}:${orderNumber}:${selectedItemId}:${reasonId}:${notes}`);
  };

  const renderStep1 = () => (
    <div className="yuume-return-step-content">
      <div className="yuume-form-group">
        <label htmlFor="return-email">Email acquistata</label>
        <input
          id="return-email"
          type="email"
          placeholder="mario@esempio.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="yuume-form-group">
        <label htmlFor="return-number">Numero ordine</label>
        <input
          id="return-number"
          type="text"
          placeholder="es. #1234"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {errorVisible && <div className="yuume-return-error-message">{errorVisible}</div>}

      <button
        type="button"
        className="yuume-return-form-submit"
        onClick={handleStep1Submit}
        disabled={!email || !orderNumber || loading}
      >
        {loading ? <span className="yuume-loader-small" /> : 'Continua'}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="yuume-return-step-content">
      <div className="yuume-form-info-text">Seleziona il prodotto da rendere:</div>
      <div className="yuume-return-items-list">
        {order?.items?.map((item) => (
          <div
            key={item.id}
            className={`yuume-return-item-option ${selectedItemId === item.id ? 'active' : ''}`}
            onClick={() => setSelectedItemId(item.id)}
          >
            <div className="yuume-return-radio">
              {selectedItemId === item.id && <div className="yuume-return-radio-inner" />}
            </div>
            {item.image && (
              <div className="yuume-return-item-image">
                <img src={item.image} alt={item.title} />
              </div>
            )}
            <div className="yuume-return-item-info">
              <div className="yuume-return-item-title">{item.title}</div>
              <div className="yuume-return-item-meta">
                {item.quantity > 1 ? `${item.quantity} pezzi • ` : ''}
                {item.price}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="yuume-return-form-submit"
        onClick={handleStep2Submit}
        disabled={selectedItemId === null || loading}
      >
        {loading ? <span className="yuume-loader-small" /> : 'Scegli motivo'}
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="yuume-return-step-content">
      <div className="yuume-form-info-text">Perché vuoi rendere questo articolo?</div>
      <div className="yuume-return-reasons-list">
        {contextReasons?.map((reason) => (
          <div
            key={reason.id}
            className={`yuume-return-reason-option ${reasonId === reason.id ? 'active' : ''}`}
            onClick={() => setReasonId(reason.id)}
          >
            <div className="yuume-return-radio">
              {reasonId === reason.id && <div className="yuume-return-radio-inner" />}
            </div>
            <span className="yuume-return-reason-label">{reason.label}</span>
          </div>
        ))}
      </div>

      <div className="yuume-form-group" style={{ marginTop: '8px' }}>
        <label>Dettagli opzionali</label>
        <textarea
          className="yuume-return-textarea"
          placeholder="Aggiungi altre informazioni..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="button"
        className="yuume-return-form-submit highlight"
        onClick={handleStep3Submit}
        disabled={!reasonId || loading}
      >
        {loading ? <span className="yuume-loader-small" /> : 'Invia richiesta'}
      </button>
    </div>
  );

  return (
    <motion.div
      className="yuume-return-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="yuume-return-form-header">
        <span className="yuume-return-form-icon">📦</span>
        <h3 className="yuume-return-form-title">Richiesta Reso</h3>
      </div>

      {message.type !== 'return_submitted' && (
        <div className="yuume-return-progress-dots">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`yuume-return-step-dot ${
                s === currentStep ? 'active' : s < currentStep ? 'completed' : 'future'
              }`}
            />
          ))}
        </div>
      )}

      <div className="yuume-return-form-body">
        <AnimatePresence mode="wait">
          {message.results &&
          message.results.type !== 'return_items' &&
          message.results.type !== 'return_reason' &&
          message.results.type !== 'return_submitted' ? (
            <LookupResult
              message={message.results.text || message.results.message}
              onRetry={() => onSubmit('Voglio fare un reso')}
            />
          ) : message.type === 'return_submitted' ? (
            <div className="yuume-return-success-block">
              <div className="yuume-return-success-icon">✅</div>
              <div className="yuume-return-success-text">
                <h4>Richiesta Ricevuta!</h4>
                <p>{message.message}</p>
              </div>
            </div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReturnForm;
