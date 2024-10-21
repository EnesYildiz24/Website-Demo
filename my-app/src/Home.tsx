import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  useEffect(() => {
    // Dieser Code wird ausgeführt, sobald die Komponente vollständig geladen ist
    console.log("Die Webseite ist vollständig geladen.");
  }, []); // Das leere Array bedeutet, dass der Effekt nur beim ersten Rendern ausgeführt wird

  return (
    <div>
      <header>
        <h1>Willkommen auf meiner Webseite!</h1>
      </header>
      <div className="box">
        <nav>
          <ul>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/quiz">Quiz</Link>
            </li>
            <li>
              <Link to="/kontakt">
                <button id="contactButton">Kontaktieren Sie mich</button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <main>
        <section>
          <h2>Was erwartet Sie?</h2>
          <p>Es erwartet Sie ein kleines About-Me und ein Quiz.</p>
        </section>
      </main>
    </div>
  );
}

export default Home;
