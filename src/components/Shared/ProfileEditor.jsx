import React, { useState, useEffect, useRef } from 'react';
import { updateProfile } from '../../services/chatApi';
import { updatePrivacyPreferences } from '../../services/privacyApi';
import { getBootConsent, broadcastConsentChange, rollbackConsent } from '../../utils/consentBridge';
import storage from '../../utils/storage';
import { LockIcon } from '../UI/Icons';
import { validateEmail } from '../../utils/validators';
import './ProfileEditor.css';

const ProfileEditor = ({
  sessionId,
  shopDomain,
  visitorId,
  profile: initialProfile,
  consent: initialConsent,
  onProfileUpdate,
  onSuccess,
  colors = {
    header: '#667eea',
    sendButton: '#667eea',
  },
  mode = 'drawer', // 'drawer' | 'inline'
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isIdentified, setIsIdentified] = useState(!!initialProfile?.isIdentified);
  const [showConfirm, setShowConfirm] = useState(false);

  const [analyticsConsent, setAnalyticsConsent] = useState(
    initialConsent?.analytics ?? getBootConsent(),
  );
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyError, setPrivacyError] = useState(null);
  const privacyErrorTimerRef = useRef(null);

  useEffect(() => {
    if (initialProfile?.name && !name) setName(initialProfile.name);
    if (initialProfile?.email && !email) setEmail(initialProfile.email);
    if (initialProfile?.isIdentified && !isIdentified) setIsIdentified(true);
  }, [initialProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (privacyErrorTimerRef.current) clearTimeout(privacyErrorTimerRef.current);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

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
        visitorId,
      });

      const serverProfile = result.customer || { name, email, isIdentified: true };
      storage.setProfile(serverProfile);

      if (serverProfile.name !== undefined) setName(serverProfile.name);
      if (serverProfile.email) setEmail(serverProfile.email);
      setIsIdentified(!!serverProfile.isIdentified);

      if (result.consent && typeof result.consent.analytics === 'boolean') {
        setAnalyticsConsent(result.consent.analytics);
        broadcastConsentChange(result.consent.analytics);
      }

      onProfileUpdate?.(serverProfile);

      setSaving(false);
      setMessage({ type: 'success', text: 'Profilo salvato!' });

      setTimeout(() => {
        onSuccess?.();
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

  const handlePrivacyToggle = async () => {
    if (privacySaving) return;

    const previousValue = analyticsConsent;
    const newValue = !analyticsConsent;

    setAnalyticsConsent(newValue);
    setPrivacyError(null);
    setPrivacySaving(true);
    broadcastConsentChange(newValue);

    try {
      await updatePrivacyPreferences(sessionId, shopDomain, visitorId, { analytics: newValue });
    } catch {
      setAnalyticsConsent(previousValue);
      rollbackConsent(previousValue);
      setPrivacyError('Non è stato possibile aggiornare la preferenza. Riprova.');
      if (privacyErrorTimerRef.current) clearTimeout(privacyErrorTimerRef.current);
      privacyErrorTimerRef.current = setTimeout(() => setPrivacyError(null), 4000);
    } finally {
      setPrivacySaving(false);
    }
  };

  if (showConfirm) {
    return (
      <div
        className="profile-confirm-container"
        style={{ '--profile-header-color': colors.header }}
      >
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
          Rimuoveremo i tuoi dati. Non potrai più gestire le preferenze fino a nuova
          identificazione.
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
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className={`profile-editor-form profile-editor-${mode}`}
      style={{ '--profile-header-color': colors.header }}
    >
      <div className="profile-editor-field email">
        <label className="profile-editor-label">Email</label>
        <input
          type="email"
          className="profile-editor-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mario@email.com"
        />
      </div>

      <div className="profile-editor-field">
        <label className="profile-editor-label">Nome Completo (Opzionale)</label>
        <input
          type="text"
          className="profile-editor-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mario Rossi"
        />
      </div>

      <div className="profile-editor-actions">
        <button
          type="submit"
          disabled={saving || message}
          className={`profile-editor-btn-save ${
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

        {isIdentified && !message && mode === 'drawer' && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={saving}
            className="profile-editor-btn-delete"
          >
            Elimina
          </button>
        )}
      </div>

      <div className="profile-editor-privacy">
        <div className="profile-editor-privacy-header">
          <LockIcon />
          <span>Privacy</span>
        </div>

        <div className="profile-editor-privacy-row">
          <div className="profile-editor-privacy-label-wrapper">
            <p className="profile-editor-privacy-title">Raccolta dati di utilizzo</p>
            <p className="profile-editor-privacy-desc">
              Aiutaci a migliorare attivando l&apos;analisi anonima delle interazioni.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={analyticsConsent}
            aria-label="Attiva raccolta dati"
            disabled={privacySaving}
            onClick={handlePrivacyToggle}
            className={`profile-editor-privacy-toggle ${analyticsConsent ? 'on' : ''} ${privacySaving ? 'saving' : ''}`}
          >
            <span className="profile-editor-privacy-thumb" />
          </button>
        </div>

        {privacyError && (
          <p className="profile-editor-privacy-error" role="alert">
            {privacyError}
          </p>
        )}
      </div>
    </form>
  );
};

export default ProfileEditor;
