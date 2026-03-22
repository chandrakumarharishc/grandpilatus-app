import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI fehlt in den Umgebungsvariablen.");
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
});

let db: Db;

export async function connectDb(): Promise<void> {
  await client.connect();
  db = client.db("grandpilatus");
  console.log("MongoDB verbunden");
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Datenbank ist noch nicht verbunden.");
  }
  return db;
}