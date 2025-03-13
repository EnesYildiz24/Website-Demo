import mysql from "mysql2/promise";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/deinedatenbank";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
  
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

