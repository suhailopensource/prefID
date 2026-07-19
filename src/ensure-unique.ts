export interface EnsureUniqueOptions {
  maxAttempts?: number;
}

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
