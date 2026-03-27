import { Campaign, CampaignFormData, CampaignPerformance } from "./types";

const API_URL = "http://localhost:3001";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function getAuthHeaders(includeJson = true): HeadersInit {
  const token = getToken();

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data as T;
}

export async function login(
  username: string,
  password: string
): Promise<{ token: string }> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await handleResponse<{ token: string }>(
    response,
    "Login fehlgeschlagen."
  );

  localStorage.setItem("token", data.token);
  return data;
}

export function logout(): void {
  localStorage.removeItem("token");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(false),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Kampagne konnte nicht gelöscht werden.");
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