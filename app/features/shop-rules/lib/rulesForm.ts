export type RulesFormState = {
  threshold: string;
  percentOff: string;
  giftThreshold: string;
  b2bMinOrder: string;
  giftVariantIds: string;
  isActive: boolean;
};

export type RulesLike = {
  threshold: number;
  percentOff: number;
  giftThreshold: number;
  b2bMinOrder: number;
  giftVariantIds: string;
  active: boolean;
};

export const rulesToForm = (rules: RulesLike): RulesFormState => {
  return {
    threshold: String(rules.threshold),
    percentOff: String(rules.percentOff),
    giftThreshold: String(rules.giftThreshold),
    b2bMinOrder: String(rules.b2bMinOrder),
    giftVariantIds: rules.giftVariantIds,
    isActive: rules.active,
  };
};

export const areFormsEqual = (a: RulesFormState, b: RulesFormState): boolean => {
  return (
    a.threshold === b.threshold &&
    a.percentOff === b.percentOff &&
    a.giftThreshold === b.giftThreshold &&
    a.b2bMinOrder === b.b2bMinOrder &&
    a.giftVariantIds === b.giftVariantIds &&
    a.isActive === b.isActive
  );
};
