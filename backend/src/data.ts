import { Campaign, CampaignPerformance } from "./types";

export let campaigns: Campaign[] = [
  {
    id: 1,
    name: "Sommer-Wellness 2026",
    description: "Wellness-Special für Sommergäste",
    segment: "Wellness-Gäste CH",
    status: "Aktiv",
    startDate: "2026-06-01",
    endDate: "2026-08-31"
  },
  {
    id: 2,
    name: "Business Weekend",
    description: "Angebot für Business-Kunden",
    segment: "Business Prospects",
    status: "Entwurf",
    startDate: "2026-09-01",
    endDate: "2026-10-15"
  }
];

export let performances: CampaignPerformance[] = [
  {
    campaignId: 1,
    periodStart: "2026-06-01",
    periodEnd: "2026-06-30",
    sentCount: 1000,
    deliveredCount: 980,
    openCount: 410,
    clickCount: 135,
    bounceCount: 20,
    unsubscribeCount: 8
  },
  {
    campaignId: 2,
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    sentCount: 500,
    deliveredCount: 495,
    openCount: 160,
    clickCount: 42,
    bounceCount: 5,
    unsubscribeCount: 2
  }
];