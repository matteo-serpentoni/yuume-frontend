import React, { useState, useEffect } from 'react';
import styles from './AppInstalled.module.css';

const AppInstalled = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Ottieni parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get('shop');
  const shopName = urlParams.get('shopName');
  const status = urlParams.get('status');
  const error = urlParams.get('error');

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (status === 'error') {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>❌</div>
          <h1 className={styles.errorTitle}>Errore Installazione</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.errorButton} onClick={() => window.close()}>
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Configurando il tuo chatbot...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.successIcon}>🎉</div>
        <h1 className={styles.title}>App Installata con Successo!</h1>
        <p className={styles.subtitle}>
          Il chatbot AI è ora attivo su <span className={styles.shopHighlight}>{shopName}</span>
        </p>
        <div className={styles.badge}>
          <div className={styles.statusDot}></div>
          Connesso a {shop}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>🚀 Il tuo chatbot è attivo!</h2>
          <p className={styles.cardText}>
            I clienti possono ora chattare con l'assistente AI sul tuo negozio. Il chatbot ha
            accesso a prodotti, ordini e informazioni del negozio.
          </p>

          <div className={styles.actions}>
            <a
              href={`https://${shop}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryButton}
            >
              🔗 Visita il tuo negozio
            </a>

            <button className={styles.secondaryButton} onClick={() => window.close()}>
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInstalled;
