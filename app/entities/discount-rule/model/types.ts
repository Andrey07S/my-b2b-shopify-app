export type RulesInput = {
  threshold: number;
  percentOff: number;
  giftThreshold: number;
  giftVariantIds: string;
  b2bMinOrder: number;
  active: boolean;
};

export type TierRulesPayload = {
  threshold: number;
  percentOff: number;
  giftThreshold: number;
  giftVariantIds: unknown;
  b2bMinOrder: number;
  active: boolean;
};
