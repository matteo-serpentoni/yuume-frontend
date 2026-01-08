import React from 'react';

/**
 * Basic ErrorBoundary to prevent the white screen of death.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI ERROR:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: 'white',
            background: '#232733',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Qualcosa è andato storto</h2>
          <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: '1.5' }}>
            Non siamo riusciti a caricare l'assistente. Prova a ricaricare la pagina.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#9C43FE',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Ricarica
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
