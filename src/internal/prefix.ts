const STRICT_MAX_LENGTH = 63;
const NON_ALPHANUMERIC = /[^A-Za-z0-9]/;

export function assertValidPrefix(
  prefix: string,
  separator: string,
  strict = false,
): void {
  if (typeof prefix !== "string" || prefix.length === 0) {
    throw new TypeError("prefid: prefix must be a non-empty string.");
  }
  if (prefix.includes(separator)) {
    throw new TypeError(
      `prefid: prefix "${prefix}" must not contain the separator "${separator}".`,
    );
  }
  if (strict) {
    const bad = NON_ALPHANUMERIC.exec(prefix);
    if (bad) {
      const char = String.fromCodePoint(
        prefix.codePointAt(bad.index) as number,
      );
      throw new TypeError(
        `prefid: prefix "${prefix}" contains an invalid character "${char}" at index ${bad.index}.`,
      );
    }
    if (prefix.length > STRICT_MAX_LENGTH) {
      throw new TypeError(
        `prefid: prefix must be at most ${STRICT_MAX_LENGTH} characters in strict mode.`,
      );
    }
  }
}
