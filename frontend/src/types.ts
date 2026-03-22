export type CampaignStatus = "Entwurf" | "Aktiv" | "Pausiert" | "Beendet";

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  segment: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  segment: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
}

export interface CampaignPerformance {
  campaignId: string;
  sentCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  bounceCount?: number;
  unsubscribeCount?: number;
}