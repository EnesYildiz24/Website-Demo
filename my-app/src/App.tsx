import React from 'react';
import { Route, Routes } from 'react-router-dom';
import About from './About';
import Quiz from './Quiz';
import Kontakt from './Kontakt';
import Home from './Home'; // Wir haben den Home-Inhalt jetzt in eine eigene Datei verschoben
import './App.css'; // Dein CSS

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />  {/* Home-Seite mit Header und Navigation */}
        <Route path="/about" element={<About />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/kontakt" element={<Kontakt />} />
      </Routes>
      <footer>
        <p>Copyright © 2024 Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}

export default App;
