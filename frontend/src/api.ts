import { Campaign, CampaignFormData, CampaignPerformance } from "./types";

const API_URL = "http://localhost:3001";

async function handleResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
  return response.json() as Promise<T>;
}

export async function getCampaigns(search = ""): Promise<Campaign[]> {
  const url = search
    ? `${API_URL}/api/campaigns?q=${encodeURIComponent(search)}`
    : `${API_URL}/api/campaigns`;

  const response = await fetch(url);
  return handleResponse<Campaign[]>(
    response,
    "Kampagnen konnten nicht geladen werden."
  );
}

export async function createCampaign(
  payload: CampaignFormData
): Promise<Campaign> {
  const response = await fetch(`${API_URL}/api/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<Campaign>(
    response,
    "Kampagne konnte nicht erstellt werden."
  );
}

export async function updateCampaign(
  id: string,
  payload: Partial<CampaignFormData>
): Promise<Campaign> {
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<Campaign>(
    response,
    "Kampagne konnte nicht aktualisiert werden."
  );
}

export async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Kampagne konnte nicht gelöscht werden.");
  }
}

export async function getPerformance(
  campaignId: string
): Promise<CampaignPerformance> {
  const response = await fetch(
    `${API_URL}/api/campaign-performance/${campaignId}`
  );

  return handleResponse<CampaignPerformance>(
    response,
    "Performance konnte nicht geladen werden."
  );
}