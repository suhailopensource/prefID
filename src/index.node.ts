import { randomFillSync } from "node:crypto";
import { setBytesProvider } from "./internal/random.js";

setBytesProvider((length) => randomFillSync(new Uint8Array(length)));

export * from "./index.js";
