/**
 * @typedef {{
 *   active?: boolean,
 *   b2bMinOrder?: number,
 * }} TierRules
 *
 * @typedef {{
 *   id?: string,
 *   displayName?: string,
 *   tags?: string[],
 * }} CustomerQuery
 *
 * @typedef {{
 *   data?: {
 *     customer?: CustomerQuery,
 *     shop?: { metafield?: { jsonValue?: TierRules } },
 *   },
 *   errors?: Array<{ message: string }>,
 * }} CustomerBlockQueryResult
 *
 * @typedef {{
 *   userErrors?: Array<{ message: string }>,
 *   node?: { tags?: string[] },
 * }} TagsMutationPayload
 *
 * @typedef {{
 *   data?: {
 *     tagsAdd?: TagsMutationPayload,
 *     tagsRemove?: TagsMutationPayload,
 *   },
 *   errors?: Array<{ message: string }>,
 * }} TagsMutationResult
 */

export {};
