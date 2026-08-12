import { useEffect, useMemo, useState } from "preact/hooks";
import { GiftChoiceList } from "./GiftChoiceList";
import { GiftStatusBanner } from "./GiftStatusBanner";
import { GIFT_ATTR, TIER_RULES_KEY } from "../shared/constants";
import { GIFT_VARIANTS_QUERY } from "../shared/graphql";
import { merchandiseLooksLikeGiftCard } from "../shared/merchandise";
import { parseRules } from "../shared/parseRules";

const RULES_SETTLE_MS = 500;

export const GiftUi = () => {
  const subtotal = Number(shopify.cost.subtotalAmount.value?.amount ?? 0);
  const canUpdateAttributes =
    shopify.instructions.value.attributes?.canUpdateAttributes !== false;
  const lines = shopify.lines.value ?? [];

  const hasExpandableParent = useMemo(() => {
    return lines.some((line) => {
      if (!line?.merchandise) return false;
      // CustomProduct / other types can't parent a free gift expand
      if (line.merchandise.type && line.merchandise.type !== "variant") {
        return false;
      }
      return !merchandiseLooksLikeGiftCard(line);
    });
  }, [lines]);

  const metafields = shopify.appMetafields.value ?? [];
  const tierEntry =
    metafields.find(
      (entry) =>
        entry.target.type === "shop" &&
        entry.metafield.key === TIER_RULES_KEY &&
        (entry.metafield.namespace === "$app" ||
          String(entry.metafield.namespace || "").includes("app")),
    ) || metafields.find((entry) => entry.metafield.key === TIER_RULES_KEY);

  const rules = parseRules(tierEntry?.metafield?.value);
  const giftThreshold = Number(rules?.giftThreshold ?? 0);
  const configuredIds = Array.isArray(rules?.giftVariantIds)
    ? rules.giftVariantIds.map(String).filter(Boolean)
    : [];
  const configuredKey = configuredIds.join("|");
  const isActive = rules?.active !== false;

  const selectedAttr =
    shopify.attributes.value.find((a) => a.key === GIFT_ATTR)?.value ?? "";

  const [selected, setSelected] = useState(selectedAttr);
  /** @type {[Record<string, string>, function]} */
  const [labels, setLabels] = useState({});
  /** @type {[string[], function]} */
  const [giftIds, setGiftIds] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRulesReady, setIsRulesReady] = useState(Boolean(rules));
  const [isGiftsReady, setIsGiftsReady] = useState(configuredIds.length === 0);

  useEffect(() => {
    setSelected(selectedAttr);
  }, [selectedAttr]);

  // Wait for app metafields before showing config warnings
  useEffect(() => {
    if (rules) {
      setIsRulesReady(true);
      return;
    }
    setIsRulesReady(false);
    const timer = setTimeout(() => setIsRulesReady(true), RULES_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [Boolean(rules)]);

  useEffect(() => {
    let cancelled = false;

    if (!rules) {
      setGiftIds([]);
      setLabels({});
      setIsGiftsReady(false);
      return;
    }

    if (configuredIds.length === 0) {
      setGiftIds([]);
      setLabels({});
      setIsGiftsReady(true);
      return;
    }

    setIsGiftsReady(false);

    (async () => {
      try {
        const result =
          /** @type {import('../shared/types').GiftVariantsQueryResult} */ (
            await shopify.query(GIFT_VARIANTS_QUERY, {
              variables: { ids: configuredIds },
            })
          );
        if (cancelled) return;

        /** @type {Record<string, string>} */
        const nextLabels = {};
        /** @type {string[]} */
        const allowed = [];

        for (const node of result.data?.nodes ?? []) {
          if (!node?.id) continue;
          if (node.product?.isGiftCard) continue;
          allowed.push(node.id);
          const productTitle = node.product?.title ?? "Gift";
          const variantTitle =
            node.title && node.title !== "Default Title" ? node.title : "";
          nextLabels[node.id] = variantTitle
            ? `${productTitle} — ${variantTitle}`
            : productTitle;
        }

        setGiftIds(allowed);
        setLabels(nextLabels);

        if (
          selectedAttr &&
          !allowed.includes(selectedAttr) &&
          canUpdateAttributes
        ) {
          const clear = await shopify.applyAttributeChange({
            type: "removeAttribute",
            key: GIFT_ATTR,
          });
          if (clear.type !== "error") setSelected("");
        }
      } catch {
        if (!cancelled) {
          setGiftIds(configuredIds);
          setLabels({});
        }
      } finally {
        if (!cancelled) setIsGiftsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configuredKey, Boolean(rules)]);

  // Gift-card-only cart: clear selection — transform cannot attach a free gift
  useEffect(() => {
    if (hasExpandableParent) return;
    if (!selectedAttr || !canUpdateAttributes) return;
    let cancelled = false;
    (async () => {
      const clear = await shopify.applyAttributeChange({
        type: "removeAttribute",
        key: GIFT_ATTR,
      });
      if (!cancelled && clear.type !== "error") setSelected("");
    })();
    return () => {
      cancelled = true;
    };
  }, [hasExpandableParent, selectedAttr, canUpdateAttributes]);

  const isLoading = !isRulesReady || (Boolean(rules) && !isGiftsReady);

  if (isLoading) {
    return (
      <s-section heading="Free gift">
        <s-stack gap="small" direction="inline" alignItems="center">
          <s-spinner accessibilityLabel="Loading free gift" />
          <s-text color="subdued">Loading free gift…</s-text>
        </s-stack>
      </s-section>
    );
  }

  if (!rules) {
    return (
      <s-banner heading="Free gift" tone="warning">
        Tier rules metafield not loaded yet. Save rules in the app, then refresh
        checkout.
      </s-banner>
    );
  }

  if (!isActive) {
    return (
      <s-banner heading="Free gift" tone="warning">
        Tier rules are disabled in the app.
      </s-banner>
    );
  }

  if (giftThreshold <= 0) {
    return (
      <s-banner heading="Free gift" tone="warning">
        Set giftThreshold in app rules.
      </s-banner>
    );
  }

  if (giftIds.length === 0) {
    return (
      <s-banner heading="Free gift" tone="warning">
        No eligible gift variants configured. Shopify Gift Cards can’t be used
        as free gifts.
      </s-banner>
    );
  }

  const remaining = Math.max(0, giftThreshold - subtotal);
  const isThresholdMet = remaining <= 0;
  const isUnlocked = isThresholdMet && hasExpandableParent;
  const progressPct = Math.max(
    0,
    Math.min(100, Math.round((subtotal / giftThreshold) * 100)),
  );

  const selectGift = async (variantId) => {
    if (!canUpdateAttributes) {
      setError("Gift selection is not available in this checkout.");
      return;
    }
    if (!hasExpandableParent) {
      setError(
        "Add a regular product to your cart to claim a free gift. Gift Cards alone can’t receive one.",
      );
      return;
    }
    setIsSaving(true);
    setError("");
    const result = await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: GIFT_ATTR,
      value: variantId,
    });
    setIsSaving(false);
    if (result.type === "error") {
      setError(result.message || "Could not save gift selection");
      return;
    }
    setSelected(variantId);
  };

  const clearGift = async () => {
    if (!canUpdateAttributes) {
      setError("Gift selection is not available in this checkout.");
      return;
    }
    setIsSaving(true);
    setError("");
    const result = await shopify.applyAttributeChange({
      type: "removeAttribute",
      key: GIFT_ATTR,
    });
    setIsSaving(false);
    if (result.type === "error") {
      setError(result.message || "Could not remove gift");
      return;
    }
    setSelected("");
  };

  return (
    <s-section heading="Free gift">
      <s-stack gap="base">
        <GiftStatusBanner
          hasExpandableParent={hasExpandableParent}
          isUnlocked={isUnlocked}
          remaining={remaining}
          progressPct={progressPct}
          subtotal={subtotal}
          giftThreshold={giftThreshold}
        />

        {error ? <s-banner tone="critical">{error}</s-banner> : null}

        {isUnlocked ? (
          <GiftChoiceList
            giftIds={giftIds}
            labels={labels}
            selected={selected}
            isSaving={isSaving}
            canUpdateAttributes={canUpdateAttributes}
            onSelect={selectGift}
          />
        ) : null}

        {isUnlocked && selected ? (
          <s-stack gap="small" direction="inline" alignItems="center">
            <s-text>Selected gift will be added free at checkout.</s-text>
            <s-button
              variant="secondary"
              disabled={isSaving || !canUpdateAttributes}
              onClick={() => {
                clearGift();
              }}
            >
              Remove gift
            </s-button>
          </s-stack>
        ) : null}
      </s-stack>
    </s-section>
  );
};
