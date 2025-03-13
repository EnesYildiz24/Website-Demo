import dotenv from "dotenv";
dotenv.config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
import mongoose from "mongoose";
import app from "./app";
import { prefillDB } from "./prefill";

async function main() {
  try {
    
    await mongoose.connect("mongodb://localhost:27017/meineDatenbank");
    console.log("MongoDB connected.");
    
    if (mongoose.connection.db) {
      console.log("✅ Verbunden mit Datenbank:", mongoose.connection.db.databaseName);
    } else {
      console.error("Datenbankverbindung ist nicht definiert.");
    }

    await prefillDB();
    console.log("Testdaten angelegt.");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log("Server is running on port " + port);
    });
  } catch (error) {
    console.error("Fehler beim Starten des Servers:", error);
  }
}

main();
