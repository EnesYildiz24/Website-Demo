import "dotenv/config";
import mongoose from "mongoose";
import app from "./app"; 
import { prefillDB } from "./prefill"; 

async function main() {
  try {
    await mongoose.connect("mongodb://localhost:27017/meinShop");
    console.log("MongoDB connected.");
    console.log(">>> CORS_ORIGIN =", process.env.CORS_ORIGIN);

    await prefillDB();
    console.log("Datenbank mit Testdaten befüllt.");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log("Server is running on port " + port);
    });
  } catch (error) {
    console.error("Fehler beim Starten des Servers:", error);
  }
}

main();
