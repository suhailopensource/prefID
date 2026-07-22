import { DEFAULT_SEPARATOR } from "../constants/index.js";
import type { PrefixedId } from "../types/index.js";

export function isId<P extends string>(
  value: unknown,
  prefix: P,
  separator: string = DEFAULT_SEPARATOR,
): value is PrefixedId<P> {
  return typeof value === "string" && value.startsWith(`${prefix}${separator}`);
}

export function getPrefix(
  value: string,
  separator: string = DEFAULT_SEPARATOR,
): string | undefined {
  const index = value.indexOf(separator);
  return index > 0 ? value.slice(0, index) : undefined;
}
