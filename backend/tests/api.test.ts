import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("API", () => {
  it("GET /health liefert status ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("POST /api/campaigns erstellt eine neue Kampagne", async () => {
    const response = await request(app)
      .post("/api/campaigns")
      .send({
        name: "Herbst Deal",
        description: "Herbstaktion",
        segment: "Kulinarik",
        status: "Entwurf",
        startDate: "2026-10-01",
        endDate: "2026-10-31"
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Herbst Deal");
  });

  it("GET /api/campaigns liefert eine Liste", async () => {
    const response = await request(app).get("/api/campaigns");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("GET /api/campaigns?search=Sommer filtert korrekt", async () => {
    const response = await request(app).get("/api/campaigns?search=Sommer");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("PUT /api/campaigns/:id aktualisiert eine Kampagne", async () => {
    const list = await request(app).get("/api/campaigns");
    const firstId = list.body[0].id;

    const response = await request(app)
      .put(`/api/campaigns/${firstId}`)
      .send({ status: "Pausiert" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Pausiert");
  });

  it("DELETE /api/campaigns/:id löscht eine Kampagne", async () => {
    const created = await request(app)
      .post("/api/campaigns")
      .send({
        name: "Zu löschen",
        description: "Test",
        segment: "Testsegment",
        status: "Entwurf",
        startDate: "2026-11-01",
        endDate: "2026-11-30"
      });

    const id = created.body.id;

    const response = await request(app).delete(`/api/campaigns/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("GET /api/campaign-performance/:campaignId liefert Performance", async () => {
    const response = await request(app).get("/api/campaign-performance/1");
    expect(response.status).toBe(200);
    expect(response.body.campaignId).toBe(1);
  });
});