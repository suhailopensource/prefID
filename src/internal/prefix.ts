export function assertValidCount(count: number, max: number): void {
  if (!Number.isInteger(count) || count < 0 || count > max) {
    throw new RangeError(
      `prefid: \`count\` must be an integer between 0 and ${max}.`,
    );
  }
}

export function assertValidPrefix(prefix: string, separator: string): void {
  if (typeof prefix !== "string" || prefix.length === 0) {
    throw new TypeError("prefid: prefix must be a non-empty string.");
  }
  if (prefix.includes(separator)) {
    throw new TypeError(
      `prefid: prefix "${prefix}" must not contain the separator "${separator}".`,
    );
  }
}
