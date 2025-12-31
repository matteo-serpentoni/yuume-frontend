import { useEffect, useState } from "react";
import Orb from "./components/Orb/Orb";

const ORB_STATE_KEY = "yuume_orb_enlarged";

export default function WidgetApp() {
  console.log("🪟 WIDGETAPP.JSX CARICATO");

  const [enlarged, setEnlarged] = useState(() => {
    const saved = sessionStorage.getItem(ORB_STATE_KEY);
    return saved === "true";
  });

  useEffect(() => {
    sessionStorage.setItem(ORB_STATE_KEY, enlarged.toString());
    window.parent.postMessage({ type: "resize", enlarged }, "*");
  }, [enlarged]);

  return (
    <div
      className="App"
      style={{
        width: enlarged ? "680px" : "250px",
        height: enlarged ? "680px" : "250px",
        background: "transparent",
        position: "relative",
        pointerEvents: "auto",
      }}
    >
      <Orb enlarged={enlarged} setEnlarged={setEnlarged} />
    </div>
  );
}
