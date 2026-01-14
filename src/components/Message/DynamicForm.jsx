import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateEmail } from '../../utils/validators';
import './DynamicForm.css';

/**
 * LookupResult Sub-component (Error/Not Found state)
 */
const LookupResult = ({ message, onRetry, loading }) => (
  <motion.div
    className="yuume-order-lookup-results-text"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
  >
    <div className="yuume-order-lookup-icon">🔍</div>
    <p className="yuume-order-lookup-message">{message}</p>
    <button onClick={onRetry} className="yuume-order-lookup-retry-btn" disabled={loading}>
      {loading ? <span className="yuume-loader-small" /> : 'Riprova'}
    </button>
  </motion.div>
);

/**
 * DynamicForm Component
 *
 * Universal renderer for interactive forms driven by the backend Form Engine.
 * Supports:
 * - Multi-step flows with progress indicator
 * - Dynamic field types (text, email, list_select)
 * - Native keyboard support (Enter to submit)
 * - Inline error display
 */
const DynamicForm = ({ message, onSubmit, loading, children }) => {
  if (!message || !message.config) {
    return null;
  }

  const { config, results, context } = message;

  // ✅ UX: If results is a form_request, we use its config instead of the original one
  // This allows the form to "reset" or "change" in place during retries
  const activeConfig =
    results?.type?.toLowerCase() === 'form_request' && results?.config ? results.config : config;

  const {
    formId,
    title,
    icon,
    steps = 1,
    currentStep = 1,
    fields = [],
    submitLabel = 'Continua',
    signalPrefix = 'FORM_SUBMIT',
    allowNotes = false,
    notesPlaceholder = 'Aggiungi dettagli...',
  } = activeConfig;

  // Local State: Map of field basic values
  const [formData, setFormData] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.id] = f.value || '';
    });
    return initial;
  });

  const [notes, setNotes] = useState('');
  const [errorVisible, setErrorVisible] = useState(null);

  // Sync state if config changes (e.g. next step) or if results arrive
  useEffect(() => {
    const newInitial = {};
    fields.forEach((f) => {
      newInitial[f.id] = f.value || formData[f.id] || '';
    });
    setFormData(newInitial);
    setErrorVisible(null);
  }, [currentStep, formId, JSON.stringify(results)]);

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    // 1. Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.id] && formData[field.id] !== 0) {
        setErrorVisible(`Il campo ${field.label} è obbligatorio.`);
        return;
      }
      if (field.type === 'email' && formData[field.id] && !validateEmail(formData[field.id])) {
        setErrorVisible('Inserisci un indirizzo email valido.');
        return;
      }
    }

    setErrorVisible(null);

    // 2. Build signal: PREFIX:val1:val2...[:notes]
    const values = fields.map((f) => {
      const val = formData[f.id];
      return typeof val === 'string' ? val.replace(/^#+/, '').trim() : val;
    });

    let signal = `${signalPrefix}:${values.join(':')}`;
    if (allowNotes && notes) {
      signal += `:${notes.trim()}`;
    }

    onSubmit(signal);
  };

  const renderField = (field) => {
    if (field.type === 'list_select') {
      return (
        <div key={field.id} className="yuume-dynamic-list-container">
          {field.label && <div className="yuume-dynamic-info-text">{field.label}</div>}
          <div className="yuume-dynamic-list">
            {field.options?.map((opt) => (
              <div
                key={opt.id}
                className={`yuume-dynamic-list-option ${formData[field.id] === opt.id ? 'active' : ''}`}
                onClick={() => handleInputChange(field.id, opt.id)}
              >
                <div className="yuume-dynamic-radio">
                  {formData[field.id] === opt.id && <div className="yuume-dynamic-radio-inner" />}
                </div>
                {opt.image && (
                  <div className="yuume-dynamic-option-image">
                    <img src={opt.image} alt={opt.title || opt.label} />
                  </div>
                )}
                <div className="yuume-dynamic-option-content">
                  <div className="yuume-dynamic-option-title">{opt.title || opt.label}</div>
                  {(opt.quantity || opt.price) && (
                    <div className="yuume-dynamic-option-meta">
                      {opt.quantity && opt.quantity > 1 ? `${opt.quantity} pezzi • ` : ''}
                      {opt.price}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={field.id} className="yuume-form-group">
        <label htmlFor={`field-${field.id}`}>{field.label}</label>
        <input
          id={`field-${field.id}`}
          type={field.type || 'text'}
          placeholder={field.placeholder}
          value={formData[field.id]}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          required={field.required}
          disabled={loading}
          autoComplete="off"
        />
      </div>
    );
  };

  return (
    <motion.div
      className="yuume-dynamic-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="yuume-dynamic-form-header">
        <span className="yuume-dynamic-form-icon">{icon}</span>
        <h3 className="yuume-dynamic-form-title">{title}</h3>
      </div>

      {steps > 1 && !children && (
        <div className="yuume-dynamic-progress-dots">
          {Array.from({ length: steps }).map((_, i) => {
            const s = i + 1;
            return (
              <div
                key={s}
                className={`yuume-dynamic-step-dot ${
                  s === currentStep ? 'active' : s < currentStep ? 'completed' : 'future'
                }`}
              />
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="yuume-dynamic-form-body">
        <AnimatePresence mode="wait">
          {children ? (
            <motion.div
              key="external-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          ) : results &&
            (results.results?.type === 'text' ||
              results.results?.message ||
              (results.type === 'text' && !results.config)) ? (
            <LookupResult
              key="error-state"
              message={
                results.results?.text ||
                results.results?.message ||
                results.text ||
                results.message ||
                'Qualcosa è andato storto.'
              }
              onRetry={() => {
                const fallbackSignal = formId.startsWith('order')
                  ? 'Cerca ordine'
                  : `Voglio fare un ${formId.split('_')[0]}`;
                onSubmit(results.retrySignal || results.results?.retrySignal || fallbackSignal);
              }}
              loading={loading}
            />
          ) : (
            <motion.div
              key={`${formId}-${currentStep}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="yuume-dynamic-step-wrapper"
            >
              <div className="yuume-dynamic-fields-container">
                {fields.map(renderField)}

                {allowNotes && (
                  <div className="yuume-form-group-notes">
                    <label>Dettagli opzionali</label>
                    <textarea
                      className="yuume-dynamic-textarea"
                      placeholder={notesPlaceholder}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              {errorVisible && <div className="yuume-dynamic-error-message">{errorVisible}</div>}

              <button type="submit" className="yuume-dynamic-form-submit" disabled={loading}>
                {loading ? <span className="yuume-loader-small" /> : submitLabel}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default DynamicForm;
