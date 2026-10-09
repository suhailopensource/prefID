export type PrefixedId<
  P extends string = string,
  S extends string = "_",
> = `${P}${S}${string}`;

export interface IdOptions {
  size?: number;
  separator?: string;
  alphabet?: string;
  strictPrefix?: boolean;
}

export type IdGenerator<S extends string = "_"> = <P extends string>(
  prefix: P,
) => PrefixedId<P, S>;
