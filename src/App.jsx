import React, { useState, useEffect } from "react";
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

  // --- DEV-ONLY PREVIEW LOGIC ---
  const [devPreview, setDevPreview] = useState({
    show: sessionStorage.getItem("yuume_dev_show_storefront") === "true",
    theme: sessionStorage.getItem("yuume_dev_storefront_theme") || "light",
  });

  useEffect(() => {
    if (import.meta.env.MODE !== "development") return;

    const handleDevUpdate = () => {
      setDevPreview({
        show: sessionStorage.getItem("yuume_dev_show_storefront") === "true",
        theme: sessionStorage.getItem("yuume_dev_storefront_theme") || "light",
      });
    };

    window.addEventListener("yuume_dev_update", handleDevUpdate);
    return () =>
      window.removeEventListener("yuume_dev_update", handleDevUpdate);
  }, []);

  // Sync dev theme with Orb luminance detection
  useEffect(() => {
    if (import.meta.env.MODE === "development" && devPreview.show) {
      window.postMessage(
        {
          type: "YUUME_BG_LUMINANCE",
          mode: devPreview.theme,
        },
        "*"
      );
    }
  }, [devPreview.theme, devPreview.show]);

  // Conditionally load MockStorefront only in dev
  const MockStorefront = React.lazy(() =>
    import.meta.env.MODE === "development"
      ? import("./components/Dev/MockStorefront")
      : Promise.resolve({ default: () => null })
  );

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
                overflow: "hidden", // Prevent internal page scrolling
                position: "fixed", // Lock the viewport
                background:
                  new URLSearchParams(window.location.search).get("embed") ||
                  (import.meta.env.MODE === "development" && devPreview.show)
                    ? "transparent"
                    : "#232733",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {import.meta.env.MODE === "development" && devPreview.show && (
                <React.Suspense fallback={null}>
                  <MockStorefront theme={devPreview.theme} />
                </React.Suspense>
              )}
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
