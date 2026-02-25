import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../services/chatApi';
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

  useEffect(() => {
    loadProfile();
  }, []);

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
        </form>
      )}
    </div>
  );
};

export default ProfileView;
