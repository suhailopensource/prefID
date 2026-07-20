/** Options for {@link ensureUnique}. */
export interface EnsureUniqueOptions {
  /**
   * Maximum number of ids to try before giving up. Guards against an
   * `exists` implementation that always reports a collision (which would
   * otherwise loop forever). Default: `5`.
   */
  maxAttempts?: number;
}

/**
 * Generates ids until one is not already taken, according to your own
 * `exists` check (a database lookup, a `Set`, a cache — anything).
 *
 * The generator stays stateless and dependency-free; you supply the source of
 * truth. In practice the very first candidate is free, so `exists` runs once.
 *
 * The return type is preserved, so a typed generator yields a typed id.
 *
 * @param generate - Produces a candidate id (e.g. `() => id("user")`).
 * @param exists - Returns `true` if the candidate is already in use. May be sync or async.
 * @param options - See {@link EnsureUniqueOptions}.
 * @throws RangeError if `maxAttempts` is not a positive integer.
 * @throws Error if no free id is found within `maxAttempts`.
 *
 * @example
 * const userId = await ensureUnique(
 *   () => id("user"),
 *   (candidate) => db.users.exists(candidate),
 * );
 */
export async function ensureUnique<T extends string>(
  generate: () => T,
  exists: (candidate: T) => boolean | Promise<boolean>,
  options: EnsureUniqueOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 5;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new RangeError("prefid: `maxAttempts` must be a positive integer.");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generate();
    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  throw new Error(
    `prefid: could not generate a unique id after ${maxAttempts} attempts.`,
  );
}
