import React, { useEffect } from "react";
import Orb from './components/Orb/Orb';

export default function WidgetApp() {
  const [enlarged, setEnlarged] = React.useState(false);

  useEffect(() => {
    const dimensions = {
      type: 'resize',
      enlarged: enlarged
    };

    window.parent.postMessage(dimensions, '*');
  }, [enlarged]);

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