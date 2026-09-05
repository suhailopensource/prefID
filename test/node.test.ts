import { describe, expect, it, vi, afterAll } from "vitest";
import { randomFillSync } from "node:crypto";
import { setBytesProvider, universalProvider } from "../src/internal/random.js";

vi.mock("node:crypto", () => {
  const randomFillSync = vi.fn((buffer: Uint8Array) => {
    buffer.fill(1);
    return buffer;
  });
  return { randomFillSync };
});

// We import the Node entry point directly as requested by the issue
import { id } from "../src/index.node.js";

describe("Node-specific entry point (src/index.node.ts)", () => {
  afterAll(() => {
    setBytesProvider(universalProvider);
    vi.restoreAllMocks();
  });

  it("generates a valid ID using the wired node:crypto provider", () => {
    const generatedId = id("node");

    expect(generatedId).toMatch(/^node_[0-9a-z]+$/);
    expect(randomFillSync).toHaveBeenCalled();
  });
});
