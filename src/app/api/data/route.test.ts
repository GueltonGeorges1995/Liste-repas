import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "./route";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "repas-api-"));
  process.env.DATA_FILE = join(dir, "data.json");
});
afterEach(async () => {
  delete process.env.DATA_FILE;
  await rm(dir, { recursive: true, force: true });
});

describe("GET /api/data", () => {
  it("returns empty data when the file does not exist", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ weeks: {}, library: [], shopping: [] });
  });

  it("returns the content of the configured file", async () => {
    const data = { weeks: {}, library: ["soupe"], shopping: [] };
    await writeFile(process.env.DATA_FILE!, JSON.stringify(data));
    const res = await GET();
    expect(await res.json()).toEqual(data);
  });
});
