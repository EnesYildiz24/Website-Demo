import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './App.css';

// Greife auf das DOM-Element zu, in das React gerendert wird
const container = document.getElementById('root');

// Überprüfe, ob das container-Element nicht null ist
if (container !== null) {
  const root = createRoot(container); // createRoot wird nur ausgeführt, wenn container existiert
  root.render(
    <Router>
      <App />
    </Router>
  );
} else {
  console.error("Das Root-Element wurde nicht gefunden.");
}
