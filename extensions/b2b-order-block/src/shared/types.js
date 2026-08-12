/**
 * @typedef {{
 *   active?: boolean,
 *   threshold?: number,
 *   percentOff?: number,
 *   giftThreshold?: number,
 *   b2bMinOrder?: number,
 * }} TierRules
 *
 * @typedef {{
 *   key?: string,
 *   value?: string,
 * }} OrderAttribute
 *
 * @typedef {{
 *   title?: string,
 *   code?: string,
 * }} DiscountApplicationNode
 *
 * @typedef {{
 *   title?: string,
 *   discountedTotalSet?: { shopMoney?: { amount?: string } },
 * }} OrderLineItem
 *
 * @typedef {{
 *   name?: string,
 *   customAttributes?: OrderAttribute[],
 *   discountApplications?: { nodes?: DiscountApplicationNode[] },
 *   lineItems?: { nodes?: OrderLineItem[] },
 *   customer?: { displayName?: string, tags?: string[] },
 * }} OrderQuery
 *
 * @typedef {{
 *   data?: {
 *     order?: OrderQuery,
 *     shop?: { metafield?: { jsonValue?: TierRules } },
 *   },
 *   errors?: Array<{ message: string }>,
 * }} OrderBlockQueryResult
 */

export {};
