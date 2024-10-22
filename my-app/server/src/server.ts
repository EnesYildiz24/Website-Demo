import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MongoDB-Verbindung
mongoose.connect('mongodb://localhost:27018/kontaktDB')
  .then(() => {
    console.log('Erfolgreich mit MongoDB verbunden');
  })
  .catch((err: Error) => {
    console.error('Fehler bei der Verbindung zu MongoDB:', err);
  });

// Mongoose Schema und Model für Kontaktformular
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Contact = mongoose.model('Contact', contactSchema);

// API-Route für das Kontaktformular
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new Contact({ name, email, message });

    // Speichern des neuen Kontakts in der Datenbank
    await newContact.save();

    res.status(200).json({ message: 'Nachricht erfolgreich gesendet.' });
  } catch (error) {
    console.error('Fehler beim Speichern der Nachricht:', error);
    res.status(500).json({ message: 'Fehler beim Speichern der Nachricht.' });
  }
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
