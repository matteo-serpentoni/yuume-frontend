import React, { useState, useEffect, useRef } from 'react';
import { updateProfile } from '../../services/chatApi';
import { updatePrivacyPreferences } from '../../services/privacyApi';
import {
  getBootConsent,
  broadcastConsentChange,
  rollbackConsent,
} from '../../utils/consentBridge';
import storage from '../../utils/storage';
import { LockIcon } from '../UI/Icons';
import { validateEmail } from '../../utils/validators';
import './ProfileView.css';

const ProfileView = ({
  onBack,
  sessionId,
  shopDomain,
  visitorId,             // B22: from parent via useChat
  profile: initialProfile,   // B22: from boot response via useChat
  consent: initialConsent,   // B22: from boot response via useChat
  onProfileUpdate,           // B22: callback to propagate changes to useChat
  colors = {
    header: '#667eea',
    sendButton: '#667eea',
    inputFocus: '#4CC2E9',
  },
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [loading] = useState(false); // B22: no fetch needed, data arrives via props
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isIdentified, setIsIdentified] = useState(!!initialProfile?.isIdentified);
  const [showConfirm, setShowConfirm] = useState(false);
  // Phase 3: Privacy consent state — boot from props, fallback to localStorage
  const [analyticsConsent, setAnalyticsConsent] = useState(
    initialConsent?.analytics ?? getBootConsent(),
  );
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyError, setPrivacyError] = useState(null);
  // Ref to cancel the error-dismissal timer if the component unmounts (state.md §3)
  const privacyErrorTimerRef = useRef(null);

  // B22: Sync state if props change (e.g., after boot response arrives later)
  useEffect(() => {
    if (initialProfile?.name && !name) setName(initialProfile.name);
    if (initialProfile?.email && !email) setEmail(initialProfile.email);
    if (initialProfile?.isIdentified && !isIdentified) setIsIdentified(true);
  }, [initialProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup the error-dismissal timer on unmount (state.md §3: timer cleanup)
  useEffect(() => {
    return () => {
      if (privacyErrorTimerRef.current) clearTimeout(privacyErrorTimerRef.current);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validazione
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email obbligatoria.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: "Inserisci un'email valida." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const result = await updateProfile(sessionId, shopDomain, {
        name,
        email,
        visitorId, // B22: ensures PersonIdentifier creation
      });

      // B22: Use server response (source of truth) — on cross-device,
      // the server returns the existing Customer's data
      const serverProfile = result.customer || { name, email, isIdentified: true };
      storage.setProfile(serverProfile);

      // Update local state from server response
      if (serverProfile.name !== undefined) setName(serverProfile.name);
      if (serverProfile.email) setEmail(serverProfile.email);
      setIsIdentified(!!serverProfile.isIdentified);

      if (result.consent && typeof result.consent.analytics === 'boolean') {
        setAnalyticsConsent(result.consent.analytics);
        broadcastConsentChange(result.consent.analytics);
      }

      // Propagate to useChat for welcome message updates
      onProfileUpdate?.(serverProfile);

      setSaving(false);
      setMessage({ type: 'success', text: 'Profilo salvato!' });
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch {
      setSaving(false);
      setMessage({ type: 'error', text: 'Errore durante il salvataggio.' });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const handleReset = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      await updateProfile(sessionId, shopDomain, { reset: true, visitorId });
      storage.removeProfile();
      setName('');
      setEmail('');
      setIsIdentified(false);
      onProfileUpdate?.(null);
      setSaving(false);
      setMessage({ type: 'success', text: 'Dati rimossi.' });
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } catch {
      setSaving(false);
      setMessage({ type: 'error', text: 'Errore durante il reset.' });
    }
  };

  // Phase 3: Analytics consent toggle with optimistic update + rollback on failure
  const handlePrivacyToggle = async () => {
    if (privacySaving) return;

    const previousValue = analyticsConsent;
    const newValue = !analyticsConsent;

    // 1. Optimistic UI update
    setAnalyticsConsent(newValue);
    setPrivacyError(null);
    setPrivacySaving(true);

    // 2. Persist to localStorage immediately (fast boot on next session)
    broadcastConsentChange(newValue);

    try {
      // B22: Pass visitorId instead of getAnonId()
      await updatePrivacyPreferences(sessionId, shopDomain, visitorId, { analytics: newValue });
      // 4. Backend confirmed — broadcast is already done, nothing more needed
    } catch {
      // 5. Backend KO — rollback UI and localStorage
      setAnalyticsConsent(previousValue);
      rollbackConsent(previousValue);
      setPrivacyError('Non è stato possibile aggiornare la preferenza. Riprova.');
      if (privacyErrorTimerRef.current) clearTimeout(privacyErrorTimerRef.current);
      privacyErrorTimerRef.current = setTimeout(() => setPrivacyError(null), 4000);
    } finally {
      setPrivacySaving(false);
    }
  };

  return (
    <div
      className="profile-view"
      style={{
        '--profile-header-color': colors.header,
        '--profile-send-button-color': colors.sendButton,
      }}
    >
      <div className="profile-header">
        <button onClick={onBack} className="back-button">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="profile-title">Il tuo Profilo</h3>
      </div>

      <p className="profile-description">
        {isIdentified
          ? 'I tuoi dati sono salvati. Puoi modificarli o rimuoverli in qualsiasi momento.'
          : "Inserisci i tuoi dati per ricevere un'assistenza migliore e offerte personalizzate."}
      </p>

      {loading ? (
        <div className="profile-loading">Caricamento...</div>
      ) : showConfirm ? (
        <div className="profile-confirm-container">
          <div className="profile-confirm-icon-wrapper">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </div>
          <h4 className="profile-confirm-title">Sei sicuro?</h4>
          <p className="profile-confirm-text">
            Rimuoveremo il tuo nome e la tua email. Non potrai più gestire il tuo profilo fino a
            nuova identificazione.
          </p>

          <div className="profile-confirm-actions">
            <button onClick={() => setShowConfirm(false)} className="profile-btn-cancel">
              Annulla
            </button>
            <button onClick={handleReset} className="profile-btn-confirm">
              Conferma
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-field email">
            <label className="profile-label">Email</label>
            <input
              type="email"
              className="profile-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario@email.com"
            />
          </div>

          <div className="profile-field">
            <label className="profile-label">Nome Completo (Opzionale)</label>
            <input
              type="text"
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
            />
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              disabled={saving || message}
              className={`profile-btn-save ${
                message ? (message.type === 'success' ? 'success' : 'error') : ''
              }`}
            >
              {message
                ? message.text
                : saving
                  ? '...'
                  : isIdentified
                    ? 'Aggiorna Profilo'
                    : 'Salva Profilo'}
            </button>

            {isIdentified && !message && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={saving}
                className="profile-btn-delete"
              >
                Elimina
              </button>
            )}
          </div>

          {/* Phase 3: Analytics consent section */}
          <div className="privacy-section">
            <div className="privacy-section-header">
              <LockIcon />
              <span>Privacy</span>
            </div>

            <div className="privacy-toggle-row">
              <div className="privacy-toggle-label">
                <p className="privacy-label-text">Raccolta dati di utilizzo</p>
                <p className="privacy-description">
                  Aiutaci a migliorare l&apos;esperienza attivando l&apos;analisi anonima delle interazioni.
                  Puoi cambiare questa scelta in qualsiasi momento.
                </p>
              </div>

              <button
                type="button"
                id="jarbris-analytics-consent-toggle"
                role="switch"
                aria-checked={analyticsConsent}
                aria-label="Attiva raccolta dati di utilizzo"
                disabled={privacySaving}
                onClick={handlePrivacyToggle}
                className={`privacy-toggle ${analyticsConsent ? 'privacy-toggle--on' : ''} ${privacySaving ? 'privacy-toggle--saving' : ''}`}
              >
                <span className="privacy-toggle-thumb" />
              </button>
            </div>

            {privacyError && (
              <p className="privacy-error" role="alert">
                {privacyError}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileView;
