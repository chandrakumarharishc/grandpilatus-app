export type CampaignStatus = "Entwurf" | "Aktiv" | "Pausiert" | "Beendet";

export interface Campaign {
  id: number;
  name: string;
  description: string;
  segment: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
}

export interface CampaignPerformance {
  campaignId: number;
  periodStart: string;
  periodEnd: string;
  sentCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  bounceCount?: number;
  unsubscribeCount?: number;
}