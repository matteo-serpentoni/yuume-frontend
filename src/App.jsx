import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Orb from './components/Orb/Orb';
import AppInstalled from './components/AppInstalled/AppInstalled';

const ORB_STATE_KEY = 'yuume_orb_enlarged';

function App() {
  console.log('📱 APP.JSX CARICATO');

  // 🔥 Aggiungi gestione stato con sessionStorage
  const [enlarged, setEnlarged] = useState(() => {
    const saved = sessionStorage.getItem(ORB_STATE_KEY);
    console.log('🔵 Stato orb caricato in App.jsx:', saved);
    return saved === 'true';
  });

  // 🔥 Salva in sessionStorage quando cambia
  useEffect(() => {
    console.log('💾 Salvataggio stato orb in App.jsx:', enlarged);
    sessionStorage.setItem(ORB_STATE_KEY, enlarged.toString());
    console.log('✅ Verificato sessionStorage:', sessionStorage.getItem(ORB_STATE_KEY));
  }, [enlarged]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Router basename={isDevelopment ? "" : "/widget"}>
      <Routes>
        {/* Homepage con l'orb */}
        <Route path="/" element={
          <div className="App" style={{
            width: '100vw',
            height: '100vh',
            background: new URLSearchParams(window.location.search).get('embed') ? 'transparent' : '#232733',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Orb enlarged={enlarged} setEnlarged={setEnlarged} />
          </div>
        } />

        {/* Pagina installazione app */}
        <Route path="/app/installed" element={<AppInstalled />} />
      </Routes>
    </Router>
  );
}

export default App;