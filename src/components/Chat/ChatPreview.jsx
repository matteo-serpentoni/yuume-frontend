import React from "react";
import Chat from "./Chat";

/**
 * ChatPreview
 * Wrapper sottile che istanzia il componente Chat reale in modalità anteprima.
 * Garantisce parità visiva al 100% poiché usa lo STESSO codice della chat reale.
 */
// 🎭 Mock data per la preview nel dashboard (stabile fuori dal component)
const MOCK_MESSAGES = [
  {
    id: "preview-1",
    sender: "assistant",
    text: "Ciao! 👋 Sono l'assistente Yuume. Posso aiutarti a trovare prodotti o tracciare un ordine?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "preview-2",
    sender: "user",
    text: "Sì, vorrei vedere gli ultimi arrivi.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "preview-3",
    sender: "assistant",
    text: "Certamente! Ecco alcune delle categorie più popolari questa settimana.",
    timestamp: new Date().toISOString(),
  },
];

/**
 * ChatPreview
 * Wrapper sottile che istanzia il componente Chat reale in modalità anteprima.
 * Garantisce parità visiva al 100% poiché usa lo STESSO codice della chat reale.
 */
const ChatPreview = ({ chatColors }) => {
  return (
    <Chat
      isPreview={true}
      messages={MOCK_MESSAGES}
      loading={false}
      chatColors={chatColors}
      sessionStatus="active"
    />
  );
};

export default ChatPreview;
