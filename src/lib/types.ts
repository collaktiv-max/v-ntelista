export const RABATT_OPTIONS = [
  "Mat & dryck",
  "Fika & café",
  "Mode & shopping",
  "Hälsa & gym",
  "Kultur & nöje",
] as const;

export type RabattOption = (typeof RABATT_OPTIONS)[number];

export interface WaitlistSubmission {
  busGuess: number;
  rabattAnswer: RabattOption;
  localBusinessAnswer: string | null;
  email: string;
}

export interface WaitlistEntry extends WaitlistSubmission {
  id: string;
  createdAt: string;
}
