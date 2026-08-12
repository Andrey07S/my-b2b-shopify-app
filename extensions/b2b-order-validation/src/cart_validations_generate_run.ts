import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "@generated/api";
import {
  CHECKOUT_COMPLETION,
  CHECKOUT_INTERACTION,
  b2bMinimumOrderMessage,
} from "@/shared/constants";
import type { TierRules } from "@/shared/types";

/** Shopify Function entry: cart.validations.generate.run */
// noinspection JSUnusedGlobalSymbols
export const cartValidationsGenerateRun = (
  input: CartValidationsGenerateRunInput,
): CartValidationsGenerateRunResult => {
  const errors: ValidationError[] = [];

  const rules = input.shop.metafield?.jsonValue as TierRules | null;

  const isB2b = input.cart.buyerIdentity?.customer?.hasAnyTag === true;
  const subtotal = parseFloat(input.cart.cost.subtotalAmount.amount);
  const minOrder = Number(rules?.b2bMinOrder ?? 0);
  const isActive = rules?.active !== false;
  const hasLines = input.cart.lines.length > 0;
  const step = input.buyerJourney.step;
  const isCheckoutStep =
    step === CHECKOUT_INTERACTION || step === CHECKOUT_COMPLETION;

  // Enforce B2B minimum only at checkout steps.
  if (
    isActive &&
    isB2b &&
    isCheckoutStep &&
    hasLines &&
    minOrder > 0 &&
    subtotal < minOrder
  ) {
    errors.push({
      message: b2bMinimumOrderMessage(minOrder, subtotal),
      target: "$.cart",
    });
  }

  return {
    operations: [{ validationAdd: { errors } }],
  };
};
