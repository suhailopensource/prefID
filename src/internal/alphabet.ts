const MIN_ALPHABET_LENGTH = 2;
const MAX_ALPHABET_LENGTH = 256;
export const SURROGATE_PATTERN = /[\uD800-\uDFFF]/;

export function assertAlphabet(alphabet: unknown): asserts alphabet is string {
  if (typeof alphabet !== "string" || alphabet.length < MIN_ALPHABET_LENGTH) {
    throw new RangeError(
      "prefid: `alphabet` must contain at least 2 characters.",
    );
  }
  if (alphabet.length > MAX_ALPHABET_LENGTH) {
    throw new RangeError(
      `prefid: \`alphabet\` must not contain more than ${MAX_ALPHABET_LENGTH} characters.`,
    );
  }
  if (SURROGATE_PATTERN.test(alphabet)) {
    throw new RangeError(
      "prefid: `alphabet` must not contain surrogate code units.",
    );
  }
  if (new Set(alphabet).size !== alphabet.length) {
    throw new RangeError(
      "prefid: `alphabet` must not contain duplicate characters.",
    );
  }
}
