import type {
  CartTransformRunInput,
  CartTransformRunResult,
} from "@generated/api";
import { FREE_GIFT_EXPAND_TITLE } from "@/shared/constants";
import type { TierRules } from "@/shared/types";

const NO_CHANGES: CartTransformRunResult = {
  operations: [],
};

const asMoney = (amount: string | number): string => {
  const n = Number(amount);
  if (Number.isNaN(n) || n < 0) return "0.0";
  return n.toFixed(2);
};

/** Shopify Function entry: cart.transform.run */
// noinspection JSUnusedGlobalSymbols
export const cartTransformRun = (
  input: CartTransformRunInput,
): CartTransformRunResult => {
  try {
    const rules = (input.shop.metafield?.jsonValue ?? null) as TierRules | null;
    const isActive = rules?.active !== false;
    const giftThreshold = Number(rules?.giftThreshold ?? 0);
    const allowedGifts = Array.isArray(rules?.giftVariantIds)
      ? rules.giftVariantIds.map(String)
      : [];

    const giftVariantId = input.cart.attribute?.value?.trim() ?? "";
    if (!isActive || !giftVariantId || giftThreshold <= 0) {
      return NO_CHANGES;
    }

    if (allowedGifts.length > 0 && !allowedGifts.includes(giftVariantId)) {
      return NO_CHANGES;
    }

    // Shopify rejects $0 gift-card lines via cart transform.
    const isGiftAlreadyAsGiftCard = input.cart.lines.some((line) => {
      if (line.merchandise.__typename !== "ProductVariant") return false;
      return (
        line.merchandise.id === giftVariantId &&
        Boolean(line.merchandise.product?.isGiftCard)
      );
    });
    if (isGiftAlreadyAsGiftCard) {
      return NO_CHANGES;
    }

    const subtotal = input.cart.lines.reduce(
      (sum, line) => sum + parseFloat(line.cost.subtotalAmount.amount),
      0,
    );
    if (subtotal < giftThreshold) {
      return NO_CHANGES;
    }

    // Never expand a Gift Card line — causes cart 422 / Unpurchasable product.
    const parent = input.cart.lines.find((line) => {
      if (line.merchandise.__typename !== "ProductVariant") return false;
      if (line.merchandise.id === giftVariantId) return false;
      if (line.merchandise.product?.isGiftCard) return false;
      return true;
    });

    if (!parent || parent.merchandise.__typename !== "ProductVariant") {
      return NO_CHANGES;
    }

    return {
      operations: [
        {
          lineExpand: {
            cartLineId: parent.id,
            title: FREE_GIFT_EXPAND_TITLE,
            expandedCartItems: [
              {
                merchandiseId: parent.merchandise.id,
                quantity: parent.quantity,
                price: {
                  adjustment: {
                    fixedPricePerUnit: {
                      amount: asMoney(parent.cost.amountPerQuantity.amount),
                    },
                  },
                },
              },
              {
                merchandiseId: giftVariantId,
                quantity: 1,
                price: {
                  adjustment: {
                    fixedPricePerUnit: {
                      amount: "0.00",
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    };
  } catch (error) {
    console.log(
      `gift-cart-transform error: ${
        error instanceof Error ? error.message : "unknown"
      }`,
    );
    return NO_CHANGES;
  }
};
