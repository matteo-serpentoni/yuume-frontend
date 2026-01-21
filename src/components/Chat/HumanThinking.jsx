import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import './HumanThinking.css';

const INTENT_PHRASES = {
  PRODUCT_ADVICE: [
    'Fammi capire cosa cerchi...',
    'Ti aiuto a scegliere...',
    'Vediamo qual è il prodotto perfetto per te...',
    'Un attimo che ti faccio qualche domanda...',
    'Cerco di capire le tue esigenze...',
  ],
  PRODUCT_DETAIL: [
    'Recupero le info sul prodotto...',
    'Cerco i dettagli per te...',
    'Controllo le caratteristiche...',
    'Fammi vedere cosa so su questo...',
    'Un attimo che trovo le specifiche...',
  ],
  PRODUCT_SEARCH: [
    'Cerco nel catalogo...',
    'Sbircio in magazzino...',
    'Vediamo cosa trovo per te...',
    'Controllo subito la disponibilità...',
    'Cerco i prodotti migliori per te...',
  ],
  ORDER_TRACK: [
    'Verifico lo stato della spedizione...',
    'Cerco il tuo pacco...',
    'Controllo dove si trova l’ordine...',
    'Un attimo che guardo il tracking...',
    'Recupero le info sulla consegna...',
  ],
  FAQ: [
    'Consulto la nostra guida...',
    'Cerco la risposta per te...',
    'Verifico le info richieste...',
    'Un attimo che controllo i dettagli...',
    'Fammi controllare nelle FAQ...',
  ],
  SHIPPING: [
    'Verifico i costi e i tempi di spedizione...',
    'Controllo le info sulla consegna...',
    'Cerco dettagli sulle spedizioni...',
    'Un attimo che guardo le policy di trasporto...',
    'Recupero i dettagli per la consegna...',
  ],
  REFUND: [
    'Verifico la nostra politica di reso...',
    'Controllo come gestire il rimborso...',
    'Cerco info sui resi e rimborsi...',
    'Un attimo che guardo la procedura di reso...',
    'Recupero i dettagli sulle restituzioni...',
  ],
  ESCALATION: [
    'Ti metto subito in contatto con un umano...',
    'Cerco un operatore per te...',
    'Avviso subito il team...',
    'Un attimo che chiamo rinforzi umani...',
    'Ti passo un mio collega in carne ed ossa...',
  ],
  DEFAULT: [
    'Fammi controllare...',
    'Un attimo che guardo...',
    'Vediamo cosa trovo per te...',
    'Cerco subito informazioni...',
    'Dammi un secondo...',
    'Controllo subito...',
  ],
};

/**
 * HumanThinking
 * A more "human" alternative to simple typing dots.
 * Slides in from the left, shows a random phrase, and slides back.
 */
const HumanThinking = ({ chatColors, intent }) => {
  const phrase = useMemo(() => {
    const list = INTENT_PHRASES[intent] || INTENT_PHRASES.DEFAULT;
    return list[Math.floor(Math.random() * list.length)];
  }, [intent]);

  return (
    <div className="human-thinking-container">
      <MessageBubble sender="assistant" type="thinking" chatColors={chatColors}>
        <div className="thinking-content">
          <span className="thinking-text">{phrase}</span>
          <div className="thinking-dots-mini">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </MessageBubble>
    </div>
  );
};

export default HumanThinking;
