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
