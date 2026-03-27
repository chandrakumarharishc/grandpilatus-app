import express from "express";
import cors from "cors";
import { getDb } from "./db";
import { authenticateToken, createToken } from "./auth";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;

  if (!validUsername || !validPassword) {
    return res.status(500).json({ error: "Auth-Konfiguration fehlt" });
  }

  if (username !== validUsername || password !== validPassword) {
    return res.status(401).json({ error: "Benutzername oder Passwort falsch" });
  }

  const token = createToken({
    username: validUsername,
    role: "admin",
  });

  res.json({ token });
});
app.get("/api/campaigns", async (req, res) => {
  try {
    const db = getDb();
    const q = String(req.query.q ?? "").trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { segment: { $regex: q, $options: "i" } },
            { status: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const campaigns = await db
      .collection("campaigns")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(campaigns);
  } catch {
    res.status(500).json({ error: "Kampagnen konnten nicht geladen werden." });
  }
});

app.post("/api/campaigns", authenticateToken, async (req, res) => {
  try {
    const db = getDb();

    const campaign = {
      id: Date.now().toString(),
      name: req.body.name ?? "",
      description: req.body.description ?? "",
      segment: req.body.segment ?? "",
      status: req.body.status ?? "Entwurf",
      startDate: req.body.startDate ?? "",
      endDate: req.body.endDate ?? "",
      createdAt: new Date().toISOString(),
    };

    await db.collection("campaigns").insertOne(campaign);
    await db.collection("performance").insertOne({
      campaignId: campaign.id,
      sentCount: 0,
      deliveredCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      unsubscribeCount: 0,
    });

    res.status(201).json(campaign);
  } catch {
    res.status(500).json({ error: "Kampagne konnte nicht erstellt werden." });
  }
});

app.put("/api/campaigns/:id", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    const update = {
      name: req.body.name ?? "",
      description: req.body.description ?? "",
      segment: req.body.segment ?? "",
      status: req.body.status ?? "Entwurf",
      startDate: req.body.startDate ?? "",
      endDate: req.body.endDate ?? "",
    };

    await db.collection("campaigns").updateOne({ id }, { $set: update });

    const updatedCampaign = await db.collection("campaigns").findOne({ id });

    if (!updatedCampaign) {
      return res.status(404).json({ error: "Kampagne nicht gefunden." });
    }

    res.json(updatedCampaign);
  } catch {
    res.status(500).json({ error: "Kampagne konnte nicht geändert werden." });
  }
});

app.delete("/api/campaigns/:id", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;

    await db.collection("campaigns").deleteOne({ id });
    await db.collection("performance").deleteOne({ campaignId: id });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Kampagne konnte nicht gelöscht werden." });
  }
});

app.get("/api/campaign-performance/:id", async (req, res) => {
  try {
    const db = getDb();
    const data = await db
      .collection("performance")
      .findOne({ campaignId: req.params.id });

    if (!data) {
      return res.status(404).json({ error: "Performance nicht gefunden." });
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: "Performance konnte nicht geladen werden." });
  }
});