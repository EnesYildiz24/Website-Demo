import React from 'react';

function Kontakt() {
  return (
    <div>
      <header>
        <h1>Kontakt</h1>
      </header>
      <div className="box">
        <nav>
          <ul>
            <li><a href="/">Home</a></li> {/* React Router könnte hier verwendet werden */}
          </ul>
        </nav>
      </div>
      <main>
        <h2>Schreiben sie mir</h2>
      </main>
      <div className="contact-form">
        <form action="https://formspree.io/f/mqakzabg" method="POST">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" placeholder="Ihr Name/Unternehmen" required />
          
          <label htmlFor="email">E-Mail:</label>
          <input type="email" id="email" name="email" placeholder="Ihre E-Mail-Adresse" required />
          
          <label htmlFor="message">Nachricht:</label>
          <textarea id="message" name="message" placeholder="Ihre Nachricht" required></textarea>
          
          <button type="submit">Senden</button>
        </form>
      </div>
      
      <main>
        <h2>Oder kontaktieren Sie mich</h2>
        <h4>Name: Enes Yidliz</h4>
        <h4>Email: Enes.Yildiz.2403@gmail.com</h4>
        <h4>Mobile: 01634194694</h4>
        <h4>Adresse: Berlin, 13409</h4>
      </main>
    </div>
  );
}

export default Kontakt;
