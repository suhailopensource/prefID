import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/index.node.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  treeshake: true,
  target: "es2020",
});
