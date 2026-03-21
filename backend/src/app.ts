import express from "express";
import cors from "cors";
import { db } from "./db";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/campaigns", async (req, res) => {
  const campaigns = await db.collection("campaigns").find().toArray();
  res.json(campaigns);
});

app.post("/api/campaigns", async (req, res) => {
  const campaign = {
    id: Date.now().toString(),
    ...req.body
  };

  await db.collection("campaigns").insertOne(campaign);

  await db.collection("performance").insertOne({
    campaignId: campaign.id,
    sentCount: 0,
    openCount: 0,
    clickCount: 0
  });

  res.json(campaign);
});

app.delete("/api/campaigns/:id", async (req, res) => {
  const id = req.params.id;

  await db.collection("campaigns").deleteOne({ id });

  res.json({ success: true });
});

app.get("/api/campaign-performance/:id", async (req, res) => {
  const data = await db
    .collection("performance")
    .findOne({ campaignId: req.params.id });

  res.json(data);
});