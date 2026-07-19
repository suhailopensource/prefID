/**
 * prefid — type-safe, Stripe-style prefixed IDs with zero dependencies.
 *
 * @example
 * import { id, createId, isId, getPrefix, ensureUnique } from "prefid";
 *
 * id("user");   // => "user_a8Kd0f2bQ1..."
 * id("order");  // => "order_9f8e7d6c5b..."
 */

export { createId, id } from "./generate.js";
export { ensureUnique } from "./ensure-unique.js";
export { getPrefix, isId } from "./validate.js";

export type { IdGenerator, IdOptions, PrefixedId } from "./types.js";
export type { EnsureUniqueOptions } from "./ensure-unique.js";
