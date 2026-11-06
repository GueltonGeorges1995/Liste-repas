import { mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emptyData, readData, writeData } from "./store";

let dir: string;
let file: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "repas-"));
  file = join(dir, "data.json");
});
afterEach(() => rm(dir, { recursive: true, force: true }));

describe("store", () => {
  it("reads a missing file as empty data", async () => {
    expect(await readData(file)).toEqual({ weeks: {}, library: [], shopping: [], shoppingHistory: [] });
  });

  it("reads back what was written, leaving no temporary file", async () => {
    const data = { weeks: { "2026-10-26": { mon: { lunch: "pâtes" } } }, library: ["pâtes"], shopping: [], shoppingHistory: [] };
    await writeData(file, data);
    expect(await readData(file)).toEqual(data);
    expect(await readdir(dir)).toEqual(["data.json"]);
  });

  it("keeps the previous file intact when a write fails", async () => {
    const before = { weeks: {}, library: ["riz"], shopping: [], shoppingHistory: [] };
    await writeData(file, before);
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    await expect(writeData(file, circular as never)).rejects.toThrow();
    expect(JSON.parse(await readFile(file, "utf8"))).toEqual(before);
    expect(await readdir(dir)).toEqual(["data.json"]);
  });

  it("cleans up its temporary file when the rename fails", async () => {
    await mkdir(file); // une cible qui est un dossier fait échouer le renommage
    await expect(writeData(file, emptyData())).rejects.toThrow();
    expect(await readdir(dir)).toEqual(["data.json"]);
  });
});
