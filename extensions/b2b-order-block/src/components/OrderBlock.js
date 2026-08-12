import { useEffect, useState } from "preact/hooks";
import { B2B_TAG, GIFT_ATTR } from "../shared/constants";
import { B2B_ORDER_BLOCK_QUERY } from "../shared/graphql";

/**
 * @typedef {import('../shared/types').TierRules} TierRules
 */

export const OrderBlock = () => {
  const orderId = globalThis.shopify?.data?.selected?.[0]?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderName, setOrderName] = useState("");
  const [isB2b, setIsB2b] = useState(false);
  const [customerName, setCustomerName] = useState("");
  /** @type {[string[], (v: string[]) => void]} */
  const [discountTitles, setDiscountTitles] = useState([]);
  const [giftVariantId, setGiftVariantId] = useState("");
  const [hasFreeGiftLine, setHasFreeGiftLine] = useState(false);
  /** @type {[TierRules | null, (v: TierRules | null) => void]} */
  const [rules, setRules] = useState(null);

  const load = async () => {
    if (!orderId) {
      setError("No order selected");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      /** @type {import('../shared/types').OrderBlockQueryResult} */
      const result = await globalThis.shopify.query(B2B_ORDER_BLOCK_QUERY, {
        variables: { id: orderId },
      });

      if (result.errors?.length) {
        setError(result.errors.map((e) => e.message).join(", "));
        setIsLoading(false);
        return;
      }

      const order = result.data?.order;
      /** @type {TierRules} */
      const tierRules = result.data?.shop?.metafield?.jsonValue ?? {};

      setOrderName(order?.name ?? "");
      setCustomerName(order?.customer?.displayName ?? "");
      setIsB2b(
        (order?.customer?.tags ?? [])
          .map((t) => String(t).toLowerCase())
          .includes(B2B_TAG),
      );
      setRules(tierRules);

      const giftAttr = (order?.customAttributes ?? []).find(
        (a) => a.key === GIFT_ATTR,
      );
      setGiftVariantId(giftAttr?.value?.trim() ?? "");

      const titles = (order?.discountApplications?.nodes ?? [])
        .map((n) => n.title || n.code)
        .filter(Boolean);
      setDiscountTitles(titles);

      const hasGiftLine = (order?.lineItems?.nodes ?? []).some((line) => {
        const discounted = parseFloat(
          line.discountedTotalSet?.shopMoney?.amount,
        );
        const title = String(line.title ?? "").toLowerCase();
        return (
          discounted === 0 ||
          title.includes("free gift") ||
          title.includes("item + free gift")
        );
      });
      setHasFreeGiftLine(hasGiftLine);
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load order");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const discountLabel =
    discountTitles.length === 0 ? "None" : discountTitles.join(", ");
  const giftLabel = hasFreeGiftLine ? "Gift applied" : "No gift";
  const collapsedSummary = isLoading
    ? "Loading…"
    : error
      ? "Error"
      : `${isB2b ? "B2B" : "Retail"} · ${discountLabel} · ${giftLabel}`.slice(
          0,
          30,
        );

  return (
    <s-admin-block
      heading="B2B Order Insights"
      collapsedSummary={collapsedSummary}
    >
      {isLoading ? <s-spinner accessibilityLabel="Loading" /> : null}

      {!isLoading && error ? (
        <s-banner tone="critical" heading="Error">
          {error}
        </s-banner>
      ) : null}

      {!isLoading && !error ? (
        <s-stack direction="block" gap="small-200">
          <s-stack
            direction="inline"
            gap="small-200"
            alignItems="center"
            justifyContent="space-between"
          >
            <s-text type="strong">{orderName || "Order"}</s-text>
            <s-badge tone={isB2b ? "success" : "neutral"}>
              {isB2b ? "B2B" : "Retail"}
            </s-badge>
          </s-stack>

          <s-stack direction="inline" gap="small-100" alignItems="center">
            <s-text color="subdued">Customer</s-text>
            <s-text>{customerName || "—"}</s-text>
          </s-stack>

          <s-stack direction="inline" gap="small-100" alignItems="center">
            <s-text color="subdued">Discount</s-text>
            <s-text>{discountLabel}</s-text>
          </s-stack>

          <s-stack
            direction="inline"
            gap="small-200"
            alignItems="center"
            justifyContent="space-between"
          >
            <s-stack direction="inline" gap="small-100" alignItems="center">
              <s-text color="subdued">Gift</s-text>
              <s-text>
                {giftVariantId
                  ? giftVariantId.replace("gid://shopify/ProductVariant/", "#")
                  : "—"}
              </s-text>
            </s-stack>
            <s-badge tone={hasFreeGiftLine ? "success" : "neutral"}>
              {hasFreeGiftLine ? "Applied" : "None"}
            </s-badge>
          </s-stack>

          <s-text color="subdued">
            Rules: {String(rules?.percentOff ?? "—")}% off ≥
            {String(rules?.threshold ?? "—")} · gift ≥
            {String(rules?.giftThreshold ?? "—")} · B2B min{" "}
            {String(rules?.b2bMinOrder ?? "—")}
            {rules?.active === false ? " · inactive" : ""}
          </s-text>
        </s-stack>
      ) : null}
    </s-admin-block>
  );
};
