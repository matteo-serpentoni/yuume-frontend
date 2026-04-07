import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile } from '../../services/chatApi';
import { getPrivacyPreferences, updatePrivacyPreferences } from '../../services/privacyApi';
import {
  getBootConsent,
  broadcastConsentChange,
  rollbackConsent,
  getAnonId,
} from '../../utils/consentBridge';
import { LockIcon } from '../UI/Icons';
import { validateEmail } from '../../utils/validators';
import './ProfileView.css';

const ProfileView = ({
  onBack,
  sessionId,
  shopDomain,
  colors = {
    header: '#667eea',
    sendButton: '#667eea',
    inputFocus: '#4CC2E9',
  },
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isIdentified, setIsIdentified] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Phase 3: Privacy consent state — boot from localStorage for instant UI, sync from backend
  const [analyticsConsent, setAnalyticsConsent] = useState(getBootConsent);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyError, setPrivacyError] = useState(null);
  // Ref to cancel the error-dismissal timer if the component unmounts (state.md §3)
  const privacyErrorTimerRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await getProfile(sessionId, shopDomain);
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setIsIdentified(!!data.isIdentified);
      }
      setLoading(false);
    };

    loadProfile();
  }, [sessionId, shopDomain]);

  // Phase 3: Sync analytics consent from backend (backend is source of truth)
  useEffect(() => {
    let cancelled = false;
    const syncConsent = async () => {
      const anonId = getAnonId();
      const serverConsent = await getPrivacyPreferences(sessionId, shopDomain, anonId);
      if (!cancelled && serverConsent !== null) {
        const serverValue = serverConsent.analytics === true;
        setAnalyticsConsent(serverValue);
        broadcastConsentChange(serverValue);
      }
    };

    syncConsent();
    // Cleanup: prevent state update after unmount if the fetch resolves late
    return () => { cancelled = true; };
  }, [sessionId, shopDomain]);

  // Cleanup the error-dismissal timer on unmount (state.md §3: timer cleanup)
  useEffect(() => {
    return () => {
      if (privacyErrorTimerRef.current) clearTimeout(privacyErrorTimerRef.current);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validazione
    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Nome ed email obbligatori.' });
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
      await updateProfile(sessionId, shopDomain, {
        name,
        email,
      });

      // ✅ Sync to localStorage for personalized welcome in next sessions
      localStorage.setItem('yuume_profile', JSON.stringify({ name, email, isIdentified: true }));

      setSaving(true); // Re-setting to trigger loading state if needed elsewhere
      setSaving(false);
      setIsIdentified(true);
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
      await updateProfile(sessionId, shopDomain, { reset: true });
      localStorage.removeItem('yuume_profile');
      setName('');
      setEmail('');
      setIsIdentified(false);
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
      const anonId = getAnonId();
      // 3. Persist to backend (source of truth)
      await updatePrivacyPreferences(sessionId, shopDomain, anonId, { analytics: newValue });
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
          <div className="profile-field">
            <label className="profile-label">Nome Completo</label>
            <input
              type="text"
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
            />
          </div>

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
