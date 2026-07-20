export type PrefixedId<P extends string = string> = `${P}_${string}`;

export interface IdOptions {
  size?: number;
  separator?: string;
  alphabet?: string;
}

export type IdGenerator = <P extends string>(prefix: P) => PrefixedId<P>;
