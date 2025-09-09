import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Orb from './components/Orb/Orb';
import AppInstalled from './components/AppInstalled/AppInstalled';

function App() {
  const [enlarged, setEnlarged] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Homepage con l'orb */}
        <Route path="/" element={
          <div className="App" style={{
            width: '100vw',
            height: '100vh',
            background: '#232733',
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