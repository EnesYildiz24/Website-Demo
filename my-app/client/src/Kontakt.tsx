import React, { useState } from 'react';

function Kontakt() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setResponseMessage(result.message);
        setFormData({ name: '', email: '', message: '' }); // Formular leeren
      } else {
        setResponseMessage('Fehler beim Senden der Nachricht.');
      }
    } catch (error) {
      setResponseMessage('Fehler beim Verbinden mit dem Server.');
    }
  };

  return (
    <div>
      <header>
        <h1>Kontakt</h1>
      </header>
      <div className="box">
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
          </ul>
        </nav>
      </div>
      <main>
        <h2>Schreiben Sie mir</h2>
        {responseMessage && <p>{responseMessage}</p>}
      </main>
      <div className="contact-form">
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ihr Name/Unternehmen"
            required
          />
          
          <label htmlFor="email">E-Mail:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ihre E-Mail-Adresse"
            required
          />
          
          <label htmlFor="message">Nachricht:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Ihre Nachricht"
            required
          />
          
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
