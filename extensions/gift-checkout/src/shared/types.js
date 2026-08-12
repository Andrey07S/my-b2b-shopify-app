/**
 * @typedef {{
 *   active?: boolean,
 *   giftThreshold?: number,
 *   giftVariantIds?: string[],
 * }} TierRules
 *
 * @typedef {{
 *   id?: string,
 *   title?: string,
 *   product?: { title?: string, isGiftCard?: boolean },
 * }} GiftVariantNode
 *
 * @typedef {{
 *   data?: { nodes?: Array<GiftVariantNode | null> },
 *   errors?: Array<{ message: string }>,
 * }} GiftVariantsQueryResult
 *
 * @typedef {{
 *   merchandise?: {
 *     type?: string,
 *     title?: string,
 *     product?: { isGiftCard?: boolean, productType?: string, title?: string },
 *   },
 * }} CartLineLike
 */

export {};
