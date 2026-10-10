export type PrefixedId<
  P extends string = string,
  S extends string = "_",
> = `${P}${S}${string}`;

export interface IdOptions {
  size?: number;
  separator?: string;
  alphabet?: string;
}

export type IdGenerator<S extends string = "_"> = <P extends string>(
  prefix: P,
) => PrefixedId<P, S>;

export type BatchIdGenerator<S extends string = "_"> = IdGenerator<S> & {
  many: <P extends string>(prefix: P, count: number) => PrefixedId<P, S>[];
};