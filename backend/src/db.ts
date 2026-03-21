import { MongoClient } from "mongodb";

const uri = "mongodb+srv://chandrakumarharishc_db_user:XXt0ga6GYHPqm8on@cluster0.uqi65hu.mongodb.net/";

const client = new MongoClient(uri);

export let db: any;

export async function connectDb() {
  await client.connect();
  db = client.db("grandpilatus");
  console.log("MongoDB verbunden");
}