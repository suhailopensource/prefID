
import { performance } from "node:perf_hooks";
import { createId, id } from "prefid";

const TOTAL = 20_000;
const WARMUP_RUNS = 3;
const MEASURED_RUNS = 7;
const MAX_BATCH_SIZE = 10_000;

const batchId = createId();

function generateIds() {
    return Array.from({ length: TOTAL }, () => id("user"));
}

function generateIdsMany() {
    const ids = [];

    for (let remaining = TOTAL; remaining > 0;) {
        const count = Math.min(remaining, MAX_BATCH_SIZE);
        ids.push(...batchId.many("user", count));
        remaining -= count;
    }

    return ids;
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function benchmark(label, generate) {
    const times = [];

    for (let i = 0; i < WARMUP_RUNS; i++) {
        generate();
    }

    for (let i = 0; i < MEASURED_RUNS; i++) {
        const start = performance.now();
        const ids = generate();
        const elapsed = performance.now() - start;

        if (ids.length !== TOTAL) {
            throw new Error(`Expected ${TOTAL} IDs, got ${ids.length}`);
        }

        times.push(elapsed);
        console.log(`${label} run ${i + 1}: ${elapsed.toFixed(2)} ms`);
    }

    return median(times);
}

console.log(`Node ${process.version}`);
console.log(`IDs per run: ${TOTAL.toLocaleString()}`);
console.log(`Warmups: ${WARMUP_RUNS}, measured runs: ${MEASURED_RUNS}`);

const baselineMedian = benchmark("Individual", generateIds);
const batchMedian = benchmark("Batch", generateIdsMany);

function printResults(label, elapsed) {
    console.log(`\n--- ${label} ---`);
    console.log(`Median: ${elapsed.toFixed(2)} ms`);
    console.log(`Time per ID: ${((elapsed * 1000) / TOTAL).toFixed(3)} µs`);
    console.log(`Throughput: ${Math.round((TOTAL * 1000) / elapsed)} IDs/sec`);
}

printResults("Baseline: Individual generation", baselineMedian);
printResults("Batch: many()", batchMedian);

console.log("\n--- Comparison ---");
console.log(`Speedup: ${(baselineMedian / batchMedian).toFixed(2)}x`);
console.log(
    `Time reduction: ${(
        ((baselineMedian - batchMedian) / baselineMedian) *
        100
    ).toFixed(1)}%`,
);
