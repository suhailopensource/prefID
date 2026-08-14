import { DEFAULT_SEPARATOR } from "../constants/index.js";
import type { PrefixedId } from "../types/index.js";

export function isId<P extends string>(
  value: unknown,
  prefix: P,
): value is PrefixedId<P>;
export function isId<P extends string, S extends string>(
  value: unknown,
  prefix: P,
  separator: S,
): value is PrefixedId<P, S>;
export function isId(
  value: unknown,
  prefix: string,
  separator: string = DEFAULT_SEPARATOR,
): boolean {
  return typeof value === "string" && value.startsWith(`${prefix}${separator}`);
}

export function getPrefix(
  value: string,
  separator: string = DEFAULT_SEPARATOR,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const index = value.indexOf(separator);
  return index > 0 ? value.slice(0, index) : undefined;
}

export function parseId(
  value: string,
  separator: string = DEFAULT_SEPARATOR,
): { prefix: string; id: string } | undefined {
  if (typeof value !== "string") return undefined;
  const index = value.indexOf(separator);
  if (index > 0) {
    return {
      prefix: value.slice(0, index),
      id: value.slice(index + separator.length),
    };
  }
  return undefined;
}
