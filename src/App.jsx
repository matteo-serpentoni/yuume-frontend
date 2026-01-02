import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Orb from "./components/Orb/Orb";
import AppInstalled from "./components/AppInstalled/AppInstalled";

const ORB_STATE_KEY = "yuume_orb_enlarged";

function App() {
  const [enlarged, setEnlarged] = useState(() => {
    const saved = sessionStorage.getItem(ORB_STATE_KEY);
    return saved === "true";
  });

  useEffect(() => {
    window.parent?.postMessage({ type: "resize", enlarged }, "*");
  }, [enlarged]);

  useEffect(() => {
    sessionStorage.setItem(ORB_STATE_KEY, enlarged.toString());
  }, [enlarged]);

  useEffect(() => {
    const isEmbed = new URLSearchParams(window.location.search).get("embed");
    if (isEmbed) {
      document.body.style.backgroundColor = "transparent";
    }
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Routes>
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
              <Orb enlarged={enlarged} setEnlarged={setEnlarged} />
            </div>
          }
        />
        <Route path="/app/installed" element={<AppInstalled />} />
        <Route
          path="/orb-preview"
          element={
            <Orb mode="preview" enlarged={true} setEnlarged={() => {}} />
          }
        />
        <Route
          path="/widget/orb-preview"
          element={
            <Orb mode="preview" enlarged={true} setEnlarged={() => {}} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
