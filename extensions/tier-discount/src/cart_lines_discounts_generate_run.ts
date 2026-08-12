import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
  CartInput,
  CartLinesDiscountsGenerateRunResult,
} from "@generated/api";
import { orderDiscountMessage } from "@/shared/constants";
import type { TierRules } from "@/shared/types";

/** Shopify Function entry: cart.lines.discounts.generate.run */
// noinspection JSUnusedGlobalSymbols
export const cartLinesDiscountsGenerateRun = (
  input: CartInput,
): CartLinesDiscountsGenerateRunResult => {
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );
  if (!hasOrderDiscountClass) {
    return { operations: [] };
  }

  const rules = input.shop.metafield?.jsonValue as TierRules | null;
  const isActive = rules?.active !== false;
  const threshold = Number(rules?.threshold ?? 0);
  const percentOff = Number(rules?.percentOff ?? 0);
  const subtotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  if (!isActive || percentOff <= 0 || subtotal < threshold) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        orderDiscountsAdd: {
          candidates: [
            {
              message: orderDiscountMessage(percentOff),
              targets: [{ orderSubtotal: { excludedCartLineIds: [] } }],
              value: { percentage: { value: percentOff } },
            },
          ],
          selectionStrategy: OrderDiscountSelectionStrategy.First,
        },
      },
    ],
  };
};
