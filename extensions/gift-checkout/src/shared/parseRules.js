/**
 * @param {unknown} raw
 * @returns {import('./types').TierRules | null}
 */
export const parseRules = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object") return /** @type {import('./types').TierRules} */ (raw);
  try {
    return /** @type {import('./types').TierRules} */ (JSON.parse(String(raw)));
  } catch {
    return null;
  }
};
