import { DEFAULT_ALPHABET, MAX_SIZE } from "../constants/index.js";
import { assertAlphabet, SURROGATE_PATTERN } from "../internal/alphabet.js";
import { randomString } from "../internal/random.js";

export interface TemplateOptions {
  placeholder?: string;
  alphabet?: string;
}

type RandomTemplate<
  P extends string,
  Ph extends string,
> = P extends `${infer Head}${Ph}${string}` ? `${Head}${string}` : string;

export function template<P extends string, Ph extends string = "#">(
  pattern: P,
  options?: TemplateOptions & { placeholder?: Ph },
): () => RandomTemplate<P, Ph>;
export function template(
  pattern: string,
  options: TemplateOptions = {},
): () => string {
  const placeholder = options.placeholder ?? "#";
  const alphabet = options.alphabet ?? DEFAULT_ALPHABET;

  if (typeof pattern !== "string" || pattern.length === 0) {
    throw new TypeError("prefid: template pattern must be a non-empty string.");
  }
  if (
    typeof placeholder !== "string" ||
    placeholder.length !== 1 ||
    SURROGATE_PATTERN.test(placeholder)
  ) {
    throw new RangeError(
      "prefid: `placeholder` must be a single BMP character.",
    );
  }
  assertAlphabet(alphabet);

  let slots = 0;
  for (const char of pattern) {
    if (char === placeholder) slots++;
  }
  if (slots === 0) {
    throw new RangeError(
      `prefid: template pattern must contain at least one "${placeholder}" placeholder.`,
    );
  }
  if (slots > MAX_SIZE) {
    throw new RangeError(
      `prefid: template pattern must not contain more than ${MAX_SIZE} "${placeholder}" placeholders.`,
    );
  }

  return () => {
    const chars = randomString(alphabet, slots);
    let index = 0;
    let result = "";
    for (const char of pattern) {
      result += char === placeholder ? chars[index++] : char;
    }
    return result;
  };
}
