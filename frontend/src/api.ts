import { Campaign, CampaignPerformance } from "./types";

const API_URL = "http://localhost:3001";

export async function getCampaigns(search = ""): Promise<Campaign[]> {
  const url = search
    ? `${API_URL}/api/campaigns?search=${encodeURIComponent(search)}`
    : `${API_URL}/api/campaigns`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Kampagnen konnten nicht geladen werden.");
  }
  return response.json();
}

export async function createCampaign(payload: Omit<Campaign, "id">): Promise<Campaign> {
  const response = await fetch(`${API_URL}/api/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Kampagne konnte nicht erstellt werden.");
  }

  return response.json();
}

export async function updateCampaign(id: number, payload: Partial<Omit<Campaign, "id">>): Promise<Campaign> {
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Kampagne konnte nicht aktualisiert werden.");
  }

  return response.json();
}

export async function deleteCampaign(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Kampagne konnte nicht gelöscht werden.");
  }
}

export async function getPerformance(campaignId: number): Promise<CampaignPerformance> {
  const response = await fetch(`${API_URL}/api/campaign-performance/${campaignId}`);

  if (!response.ok) {
    throw new Error("Performance konnte nicht geladen werden.");
  }

  return response.json();
}