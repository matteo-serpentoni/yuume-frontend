import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import OrbWithCustomization from "./components/Orb/OrbWithCustomization";
import Orb from "./components/Orb/Orb";
import AppInstalled from "./components/AppInstalled/AppInstalled";
import OrbPreview from "./pages/OrbPreview";

const ORB_STATE_KEY = "yuume_orb_enlarged";

function App() {
  console.log("📱 APP.JSX CARICATO");

  // 🔥 Aggiungi gestione stato con sessionStorage
  const [enlarged, setEnlarged] = useState(() => {
    const saved = sessionStorage.getItem(ORB_STATE_KEY);
    console.log("🔵 Stato orb caricato in App.jsx:", saved);
    return saved === "true";
  });

  // Notifica subito al parent la misura corretta al primo load dell'iframe
  useEffect(() => {
    const saved = sessionStorage.getItem(ORB_STATE_KEY) === "true";
    window.parent?.postMessage({ type: "resize", enlarged: saved }, "*");
  }, []);

  // 🔥 Salva in sessionStorage quando cambia
  useEffect(() => {
    console.log("💾 Salvataggio stato orb in App.jsx:", enlarged);
    sessionStorage.setItem(ORB_STATE_KEY, enlarged.toString());
    console.log(
      "✅ Verificato sessionStorage:",
      sessionStorage.getItem(ORB_STATE_KEY)
    );
  }, [enlarged]);

  const isDevelopment = import.meta.env.DEV;

  return (
    <Router basename={isDevelopment ? "" : "/widget"}>
      <Routes>
        {/* Homepage con l'orb */}
        <Route
          path="/"
          element={
            <div
              className="App"
              style={{
                width: "100vw",
                height: "100vh",
                background: new URLSearchParams(window.location.search).get(
                  "embed"
                )
                  ? "transparent"
                  : "#232733",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isDevelopment ? (
                <Orb enlarged={enlarged} setEnlarged={setEnlarged} />
              ) : (
                <OrbWithCustomization
                  enlarged={enlarged}
                  setEnlarged={setEnlarged}
                />
              )}
            </div>
          }
        />

        {/* Pagina installazione app */}
        <Route path="/app/installed" element={<AppInstalled />} />

        {/* Pagina preview orb */}
        <Route path="/orb-preview" element={<OrbPreview />} />
      </Routes>
    </Router>
  );
}

export default App;
