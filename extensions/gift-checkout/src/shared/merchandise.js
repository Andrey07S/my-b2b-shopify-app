/**
 * Gift cards can't parent a free-gift expand in cart transform.
 * @param {unknown} line
 */
export const merchandiseLooksLikeGiftCard = (line) => {
  if (!line || typeof line !== "object") return false;
  const cartLine = /** @type {import('./types').CartLineLike} */ (line);
  const merch = cartLine.merchandise;
  if (!merch) return false;
  if (merch.product?.isGiftCard === true) return true;
  const type = String(merch.product?.productType || "").toLowerCase();
  const title = String(merch.product?.title || merch.title || "").toLowerCase();
  return type === "gift card" || title === "gift card";
};

/**
 * @param {string} gid
 */
export const shortGiftLabel = (gid) => {
  const id = String(gid).split("/").pop() || String(gid);
  return `Gift #${id}`;
};
