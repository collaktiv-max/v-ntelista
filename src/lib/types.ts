export const MER_BUSS_OPTIONS = [
  "Billigare biljetter",
  "Tätare turer",
  "Fler linjer och hållplatser",
  "Kortare restid",
  "Bekvämare bussar",
] as const;

export const RABATT_OPTIONS = [
  "Mat & dryck",
  "Fika & café",
  "Mode & shopping",
  "Hälsa & gym",
  "Kultur & nöje",
] as const;

export type MerBussOption = (typeof MER_BUSS_OPTIONS)[number];
export type RabattOption = (typeof RABATT_OPTIONS)[number];

export interface WaitlistSubmission {
  busGuess: number;
  merBussAnswer: MerBussOption | null;
  rabattAnswer: RabattOption | null;
  email: string;
}

export interface WaitlistEntry extends WaitlistSubmission {
  id: string;
  createdAt: string;
}
