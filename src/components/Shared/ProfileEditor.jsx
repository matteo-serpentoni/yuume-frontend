import React, { useState, useEffect, useRef } from 'react';
import { updateProfile } from '../../services/chatApi';
import { updatePrivacyPreferences, exportMyData, deleteMyData } from '../../services/privacyApi';
import { getBootConsent, broadcastConsentChange, rollbackConsent } from '../../utils/consentBridge';
import storage from '../../utils/storage';
import { LockIcon } from '../UI/Icons';
import { validateEmail } from '../../utils/validators';
import ConfirmDialog from '../UI/ConfirmDialog';
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
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
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
    setMessage({ type: 'success', text: 'Eliminazione in corso...' });

    try {
      await deleteMyData(sessionId, shopDomain, visitorId);
      storage.removeProfile(); // Clear local storage containing profile/identity

      setName('');
      setEmail('');
      setIsIdentified(false);
      onProfileUpdate?.(null);

      setMessage({ type: 'success', text: 'Dati eliminati.' });

      // Force an immediate reload to ensure ghost state is wiped and a clean boot is triggered
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setSaving(false);
      if (err.message.includes('identity_verification_required')) {
        setMessage({ type: 'error', text: 'Identità non verificabile.' });
      } else {
        setMessage({ type: 'error', text: 'Errore durante il reset.' });
      }
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleExport = async () => {
    setShowExportConfirm(false);
    setSaving(true);
    setMessage({ type: 'success', text: 'Download avviato...' });

    try {
      await exportMyData(sessionId, shopDomain, visitorId);
      setMessage({ type: 'success', text: 'Dati esportati.' });
    } catch (err) {
      if (err.message.includes('identity_verification_required')) {
        setMessage({ type: 'error', text: 'Identità non verificata. Impossibile scaricare.' });
      } else {
        setMessage({ type: 'error', text: "Errore durante l'export." });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const executePrivacyToggle = async (newValue) => {
    const previousValue = analyticsConsent;

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
      privacyErrorTimerRef.current = setTimeout(() => {
        setPrivacyError(null);
      }, 3000);
    } finally {
      setPrivacySaving(false);
    }
  };

  const handlePrivacyToggleClick = () => {
    if (privacySaving) return;

    if (analyticsConsent === true) {
      setShowPrivacyConfirm(true);
    } else {
      executePrivacyToggle(true);
    }
  };

  const confirmPrivacyRevocation = () => {
    setShowPrivacyConfirm(false);
    executePrivacyToggle(false);
  };

  return (
    <>
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
        </div>

        {isIdentified && !message && mode === 'drawer' && (
          <div className="profile-editor-gdpr-actions">
            <button
              type="button"
              onClick={() => setShowExportConfirm(true)}
              disabled={saving}
              className="profile-editor-btn-export"
            >
              Scarica i miei dati
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={saving}
              className="profile-editor-btn-delete"
            >
              Elimina Profilo
            </button>
          </div>
        )}

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
              aria-label="Attiva/disattiva raccolta dati"
              disabled={privacySaving}
              onClick={handlePrivacyToggleClick}
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
      <ConfirmDialog
        isOpen={showPrivacyConfirm}
        title="Sei sicuro?"
        message="Disattivando questa opzione, Jarbris non potrà più offrirti consigli personalizzati."
        confirmText="Disattiva"
        cancelText="Annulla"
        onConfirm={confirmPrivacyRevocation}
        onCancel={() => setShowPrivacyConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showExportConfirm}
        title="Scarica dati"
        message="Il file JSON con tutti i tuoi dati associati alla tua identità verrà preparato e scaricato."
        confirmText="Avvia Download"
        cancelText="Annulla"
        onConfirm={handleExport}
        onCancel={() => setShowExportConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title="Eliminazione irreversibile"
        message="Questa operazione eliminerà permanentemente tutti i tuoi dati e ti sgancerà dal servizio."
        confirmText="Sì, elimina tutto"
        cancelText="Annulla"
        onConfirm={handleReset}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default ProfileEditor;
