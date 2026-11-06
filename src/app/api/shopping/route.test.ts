import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as getWeekRoute } from "../weeks/[weekStart]/route";
import { PUT } from "../weeks/[weekStart]/[day]/[moment]/route";
import { DELETE as deleteChecked } from "./checked/route";
import { DELETE as deleteItem, PATCH } from "./[id]/route";
import { GET, POST } from "./route";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "repas-shopping-"));
  process.env.DATA_FILE = join(dir, "data.json");
});
afterEach(async () => {
  delete process.env.DATA_FILE;
  await rm(dir, { recursive: true, force: true });
});

type Item = { id: string; label: string; checked: boolean };

const list = async () => (await (await GET()).json()) as { items: Item[]; suggestions: string[] };
const items = async () => (await list()).items;
const labels = async () => (await items()).map((i) => i.label);

const add = (body: unknown) =>
  POST(new Request("http://test", { method: "POST", body: JSON.stringify(body) }));
const addItem = async (label: string) => (await (await add({ label })).json()) as Item;

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const setChecked = (id: string, body: unknown) =>
  PATCH(new Request("http://test", { method: "PATCH", body: JSON.stringify(body) }), ctx(id));
const remove = (id: string) => deleteItem(new Request("http://test", { method: "DELETE" }), ctx(id));

describe("shopping list", () => {
  it("is empty at first", async () => {
    expect(await list()).toEqual({ items: [], suggestions: [] });
  });

  it("shows an added item, unchecked", async () => {
    const res = await add({ label: "  2 kg de pommes " });
    expect(res.status).toBe(201);
    expect(await items()).toEqual([{ id: expect.any(String), label: "2 kg de pommes", checked: false }]);
  });

  it("keeps items in the order they were added", async () => {
    await addItem("lait");
    await addItem("beurre");
    expect(await labels()).toEqual(["lait", "beurre"]);
  });

  it("accepts the same label twice", async () => {
    await addItem("lait");
    await addItem("lait");
    expect(await labels()).toEqual(["lait", "lait"]);
  });

  it.each([{ label: "" }, { label: "  " }, { label: 3 }, {}, "nope"])("rejects the body %j", async (body) => {
    expect((await add(body)).status).toBe(400);
    expect(await items()).toEqual([]);
  });
});

describe("PATCH /api/shopping/[id]", () => {
  it("checks then unchecks an item, durably", async () => {
    const { id } = await addItem("lait");
    expect((await setChecked(id, { checked: true })).status).toBe(200);
    expect((await items())[0].checked).toBe(true);
    await setChecked(id, { checked: false });
    expect((await items())[0].checked).toBe(false);
  });

  it("only touches the targeted item", async () => {
    const milk = await addItem("lait");
    await addItem("beurre");
    await setChecked(milk.id, { checked: true });
    expect((await items()).map((i) => i.checked)).toEqual([true, false]);
  });

  it("answers 404 for an unknown item", async () => {
    expect((await setChecked("nope", { checked: true })).status).toBe(404);
  });

  it.each([{}, { checked: "yes" }, "nope"])("rejects the body %j", async (body) => {
    const { id } = await addItem("lait");
    expect((await setChecked(id, body)).status).toBe(400);
  });
});

describe("DELETE /api/shopping/[id]", () => {
  it("removes that item alone", async () => {
    const milk = await addItem("lait");
    await addItem("beurre");
    expect((await remove(milk.id)).status).toBe(200);
    expect(await labels()).toEqual(["beurre"]);
  });

  it("succeeds when the item is already gone", async () => {
    expect((await remove("nope")).status).toBe(200);
  });
});

describe("DELETE /api/shopping/checked", () => {
  it("removes every checked item and only those", async () => {
    const milk = await addItem("lait");
    await addItem("beurre");
    const eggs = await addItem("oeufs");
    await addItem("pain");
    await setChecked(milk.id, { checked: true });
    await setChecked(eggs.id, { checked: true });
    expect((await deleteChecked()).status).toBe(200);
    expect(await labels()).toEqual(["beurre", "pain"]);
  });

  it("succeeds on an empty list", async () => {
    expect((await deleteChecked()).status).toBe(200);
  });
});

describe("suggestions", () => {
  it("offer the labels already used, once each, sorted", async () => {
    await addItem("Riz");
    await addItem("lait");
    await addItem("  RIZ ");
    expect((await list()).suggestions).toEqual(["lait", "Riz"]);
  });

  it("outlive the removal of their items", async () => {
    const milk = await addItem("lait");
    await remove(milk.id);
    await addItem("riz");
    await setChecked((await items())[0].id, { checked: true });
    await deleteChecked();
    expect(await items()).toEqual([]);
    expect((await list()).suggestions).toEqual(["lait", "riz"]);
  });
});

describe("independence from the planning", () => {
  it("does not feed the library nor appear in a week", async () => {
    await addItem("lait");
    const res = await getWeekRoute(new Request("http://test"), {
      params: Promise.resolve({ weekStart: "2026-10-26" }),
    });
    expect(((await res.json()).slots as { meal: string | null }[]).every((s) => s.meal === null)).toBe(true);
  });

  it("is untouched by planning meals", async () => {
    await addItem("lait");
    await PUT(new Request("http://test", { method: "PUT", body: JSON.stringify({ meal: "Riz" }) }), {
      params: Promise.resolve({ weekStart: "2026-10-26", day: "mon", moment: "lunch" }),
    });
    expect(await labels()).toEqual(["lait"]);
    expect((await list()).suggestions).toEqual(["lait"]);
  });
});
