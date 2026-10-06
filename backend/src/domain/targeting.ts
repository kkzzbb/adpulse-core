export const campaignDevices = [
  "DESKTOP",
  "MOBILE",
  "TABLET",
] as const;


export type CampaignDevice =
  typeof campaignDevices[number];


export interface CampaignTargeting {
  campaignId: string;

  countries: string[];

  devices: CampaignDevice[];

  ageMin: number | null;

  ageMax: number | null;
}


export interface UpdateCampaignTargetingInput {
  countries: string[];

  devices: CampaignDevice[];

  ageMin: number | null;

  ageMax: number | null;
}