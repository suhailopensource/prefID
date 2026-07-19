/**
 * A string that is guaranteed, at the type level, to start with `${P}_`.
 *
 * This is what makes the ids "type-safe": a `PrefixedId<"user">` cannot be
 * passed where a `PrefixedId<"order">` is expected, and vice versa.
 */
export type PrefixedId<P extends string = string> = `${P}_${string}`;

/** Options that control how the random part of an id is generated. */
export interface IdOptions {
  /** Number of random characters after the separator. Default: `24`. */
  size?: number;
  /** Character(s) placed between the prefix and the random part. Default: `"_"`. */
  separator?: string;
  /** Alphabet used for the random part. Default: base62 (`0-9A-Za-z`). */
  alphabet?: string;
}

/** A configured generator: takes a prefix and returns a `PrefixedId`. */
export type IdGenerator = <P extends string>(prefix: P) => PrefixedId<P>;
