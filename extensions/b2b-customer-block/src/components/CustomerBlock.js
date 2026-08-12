import { useEffect, useState } from "preact/hooks";
import { B2B_TAG } from "../shared/constants";
import {
  ADD_B2B_TAG_MUTATION,
  B2B_CUSTOMER_BLOCK_QUERY,
  REMOVE_B2B_TAG_MUTATION,
} from "../shared/graphql";

/**
 * @typedef {import('../shared/types').TierRules} TierRules
 */

export const CustomerBlock = () => {
  const customerId = globalThis.shopify?.data?.selected?.[0]?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [displayName, setDisplayName] = useState("");
  /** @type {[string[], (tags: string[]) => void]} */
  const [tags, setTags] = useState([]);
  /** @type {[number | null, (v: number | null) => void]} */
  const [b2bMinOrder, setB2bMinOrder] = useState(null);
  const [isRulesActive, setIsRulesActive] = useState(true);

  const isB2b = tags.map((t) => t.toLowerCase()).includes(B2B_TAG);

  const load = async () => {
    if (!customerId) {
      setError("No customer selected");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      /** @type {import('../shared/types').CustomerBlockQueryResult} */
      const result = await shopify.query(B2B_CUSTOMER_BLOCK_QUERY, {
        variables: { id: customerId },
      });

      if (result.errors?.length) {
        setError(result.errors.map((e) => e.message).join(", "));
        setIsLoading(false);
        return;
      }

      const customer = result.data?.customer;
      /** @type {TierRules} */
      const rules = result.data?.shop?.metafield?.jsonValue ?? {};

      setDisplayName(customer?.displayName ?? "");
      setTags(customer?.tags ?? []);
      setB2bMinOrder(
        typeof rules.b2bMinOrder === "number" ? rules.b2bMinOrder : null,
      );
      setIsRulesActive(rules.active !== false);
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customer");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [customerId]);

  const toggleB2b = async () => {
    if (!customerId || isSaving) return;
    setIsSaving(true);
    setError("");
    setSuccess("");

    const mutation = isB2b ? REMOVE_B2B_TAG_MUTATION : ADD_B2B_TAG_MUTATION;

    try {
      /** @type {import('../shared/types').TagsMutationResult} */
      const result = await shopify.query(mutation, {
        variables: { id: customerId, tags: [B2B_TAG] },
      });

      const payload = isB2b ? result.data?.tagsRemove : result.data?.tagsAdd;
      const userErrors = payload?.userErrors ?? [];

      if (result.errors?.length || userErrors.length) {
        const messages = [
          ...(result.errors ?? []).map((e) => e.message),
          ...userErrors.map((e) => e.message),
        ];
        setError(messages.join(", "));
        setIsSaving(false);
        return;
      }

      setTags(payload?.node?.tags ?? []);
      setIsSaving(false);
      // Admin blocks have no App Bridge toast — use inline feedback
      setSuccess(isB2b ? "B2B tag removed" : "B2B tag added");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update tags");
      setIsSaving(false);
    }
  };

  return (
    <s-admin-block heading="B2B Tier Status">
      <s-stack direction="block" gap="base">
        {isLoading ? <s-spinner accessibilityLabel="Loading" /> : null}

        {!isLoading && error ? (
          <s-banner tone="critical" heading="Error">
            {error}
          </s-banner>
        ) : null}

        {!isLoading && success ? (
          <s-banner tone="success" heading="Done">
            {success}
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
              <s-text type="strong">{displayName || "Customer"}</s-text>
              <s-badge tone={isB2b ? "success" : "neutral"}>
                {isB2b ? "B2B" : "Retail"}
              </s-badge>
            </s-stack>

            <s-text>
              B2B minimum order:{" "}
              {b2bMinOrder == null ? "—" : String(b2bMinOrder)}
              {!isRulesActive ? " (rules inactive)" : ""}
            </s-text>

            <s-button
              onClick={toggleB2b}
              {...(isSaving ? { loading: true } : {})}
              variant={isB2b ? "secondary" : "primary"}
            >
              {isB2b ? "Remove b2b tag" : "Add b2b tag"}
            </s-button>
          </s-stack>
        ) : null}
      </s-stack>
    </s-admin-block>
  );
};
