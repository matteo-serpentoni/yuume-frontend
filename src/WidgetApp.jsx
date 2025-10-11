import { useEffect, useState } from "react";
import Orb from './components/Orb/Orb';

const ORB_STATE_KEY = 'yuume_orb_enlarged';

export default function WidgetApp() {
  console.log('🪟 WIDGETAPP.JSX CARICATO');

  const [enlarged, setEnlarged] = useState(() => {
    const saved = sessionStorage.getItem(ORB_STATE_KEY);
    console.log('🔵 Stato orb caricato:', saved);
    return saved === 'true';
  });

  // 🔥 Salva in sessionStorage ogni volta che enlarged cambia
  useEffect(() => {
    console.log('💾 Salvataggio stato orb:', enlarged);
    sessionStorage.setItem(ORB_STATE_KEY, enlarged.toString());
    console.log('✅ sessionStorage salvato:', sessionStorage.getItem(ORB_STATE_KEY));

    // Comunica resize al parent
    window.parent.postMessage({
      type: 'resize',
      enlarged: enlarged
    }, '*');
  }, [enlarged]);

  console.log('🟡 Stato enlarged attuale:', enlarged);

  return (
    <div
      className="App"
      style={{
        width: enlarged ? '680px' : '250px',
        height: enlarged ? '680px' : '250px',
        background: 'transparent',
        position: 'relative',
        pointerEvents: 'auto'
      }}
    >
      <Orb enlarged={enlarged} setEnlarged={setEnlarged} />
    </div>
  );
}