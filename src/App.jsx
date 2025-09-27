import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Orb from './components/Orb/Orb';
import AppInstalled from './components/AppInstalled/AppInstalled';

function App() {
  const [enlarged, setEnlarged] = useState(false);
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