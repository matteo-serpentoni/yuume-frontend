import './wdyr'; // Must be first — patches React for re-render tracking (dev only)
import './config/bridgeMock.dev'; // Dev-only: simulates Shopify cart bridge
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/UI/ErrorBoundary';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
}
