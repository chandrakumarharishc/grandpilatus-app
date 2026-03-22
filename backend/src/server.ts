import "dotenv/config";
import { app } from "./app";
import { connectDb } from "./db";

const PORT = Number(process.env.PORT) || 3001;

async function start(): Promise<void> {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Backend läuft auf http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Serverstart fehlgeschlagen:", error);
    process.exit(1);
  }
}

start();