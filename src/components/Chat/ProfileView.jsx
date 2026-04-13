import React from 'react';
import ProfileEditor from '../Shared/ProfileEditor';
import { BackArrowIcon } from '../UI/Icons';
import './ProfileView.css';

const ProfileView = ({
  onBack,
  sessionId,
  shopDomain,
  visitorId,
  profile,
  consent,
  onProfileUpdate,
  requiresReConsent,
  colors = {
    header: '#667eea',
    sendButton: '#667eea',
    inputFocus: '#4CC2E9',
  },
}) => {
  const isIdentified = !!profile?.isIdentified;

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
          <BackArrowIcon size={18} />
        </button>
        <h3 className="profile-title">Il tuo Profilo</h3>
      </div>

      <p className="profile-description">
        {requiresReConsent && (
          <span className="profile-reconsent-inline-alert">
            ⚠️ Abbiamo aggiornato la Privacy Policy.
          </span>
        )}
        {isIdentified
          ? 'I tuoi dati sono salvati. Puoi modificarli o rimuoverli in qualsiasi momento.'
          : "Inserisci i tuoi dati per ricevere un'assistenza migliore e offerte personalizzate."}
      </p>

      <ProfileEditor
        sessionId={sessionId}
        shopDomain={shopDomain}
        visitorId={visitorId}
        profile={profile}
        consent={consent}
        onProfileUpdate={onProfileUpdate}
        onSuccess={onBack}
        colors={colors}
        mode="drawer"
      />
    </div>
  );
};

export default ProfileView;
