# Yuume Widget Chat

Widget chat embeddabile e personalizzabile per i siti web, basato su Yuume AI. Questo repository contiene il codice sorgente del frontend del widget.

## 🚀 Guida Rapida

### Requisiti

- Node.js (v18 o superiore)
- npm o yarn

### Installazione

```bash
npm install
```

### Sviluppo Locali

Avvia l'ambiente di sviluppo:

```bash
npm run dev
```

### Compilazione (Build)

Per generare la versione ottimizzata da distribuire:

```bash
npm run build
```

I file compilati saranno disponibili nella cartella `dist/`.

## 📂 Struttura del Progetto

- `src/components/`: Componenti React (organizzati in cartelle PascalCase).
- `src/hooks/`: Hook personalizzati per la gestione dello stato e della chat.
- `src/services/`: Client per l'interazione con le API di Yuume.
- `src/utils/`: Funzioni di utilità e formattazione condivise.

## 🔧 Configurazione

Le variabili d'ambiente possono essere configurate nel file `.env.development` (locale) o `.env.production` (live).
L'URL dell'API principale è configurabile tramite `VITE_API_URL`.
