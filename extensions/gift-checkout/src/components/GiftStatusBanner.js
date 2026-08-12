/**
 * @param {{
 *   hasExpandableParent: boolean,
 *   isUnlocked: boolean,
 *   remaining: number,
 *   progressPct: number,
 *   subtotal: number,
 *   giftThreshold: number,
 * }} props
 */
export const GiftStatusBanner = ({
  hasExpandableParent,
  isUnlocked,
  remaining,
  progressPct,
  subtotal,
  giftThreshold,
}) => {
  if (!hasExpandableParent) {
    return (
      <s-banner tone="info">
        Free gifts can’t be attached to Gift Cards alone. Add another product to
        unlock and receive a free gift.
      </s-banner>
    );
  }

  if (isUnlocked) {
    return (
      <s-banner tone="success">
        You’ve unlocked a free gift. Choose one below, or remove it anytime.
      </s-banner>
    );
  }

  return (
    <s-banner tone="info">
      Add {shopify.i18n.formatCurrency(remaining)} more to unlock a free gift (
      {progressPct}%). Subtotal {shopify.i18n.formatCurrency(subtotal)} /{" "}
      {shopify.i18n.formatCurrency(giftThreshold)}.
    </s-banner>
  );
};
