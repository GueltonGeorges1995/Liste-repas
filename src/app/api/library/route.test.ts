import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as getWeekRoute } from "../weeks/[weekStart]/route";
import { PUT } from "../weeks/[weekStart]/[day]/[moment]/route";
import { DELETE, GET } from "./route";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "repas-library-"));
  process.env.DATA_FILE = join(dir, "data.json");
});
afterEach(async () => {
  delete process.env.DATA_FILE;
  await rm(dir, { recursive: true, force: true });
});

const WEEK = "2026-10-26";

const putMeal = (day: string, moment: string, meal: string) =>
  PUT(new Request("http://test", { method: "PUT", body: JSON.stringify({ meal }) }), {
    params: Promise.resolve({ weekStart: WEEK, day, moment }),
  });

const library = async () => (await (await GET()).json()).meals as string[];

const removeFromLibrary = (body: unknown) =>
  DELETE(new Request("http://test", { method: "DELETE", body: JSON.stringify(body) }));

const plannedMeals = async () => {
  const res = await getWeekRoute(new Request("http://test"), { params: Promise.resolve({ weekStart: WEEK }) });
  return ((await res.json()).slots as { meal: string | null }[]).map((s) => s.meal).filter(Boolean);
};

describe("library", () => {
  it("is empty at first", async () => {
    expect(await library()).toEqual([]);
  });

  it("gains a meal when it is put in a slot", async () => {
    await putMeal("mon", "lunch", "Pâtes bolo");
    expect(await library()).toEqual(["Pâtes bolo"]);
  });

  it("holds a single entry for labels differing by case or edge spaces", async () => {
    await putMeal("mon", "lunch", "Pâtes bolo");
    await putMeal("mon", "dinner", "pâtes bolo  ");
    await putMeal("tue", "lunch", "  PÂTES BOLO");
    expect(await library()).toEqual(["Pâtes bolo"]);
  });

  it("keeps distinct meals, sorted alphabetically", async () => {
    await putMeal("mon", "lunch", "Riz");
    await putMeal("mon", "dinner", "Quiche");
    expect(await library()).toEqual(["Quiche", "Riz"]);
  });
});

describe("DELETE /api/library", () => {
  it("removes a meal, matching case and edge spaces insensitively", async () => {
    await putMeal("mon", "lunch", "Pâtes bolo");
    await putMeal("mon", "dinner", "Riz");
    expect((await removeFromLibrary({ meal: " pâtes BOLO " })).status).toBe(200);
    expect(await library()).toEqual(["Riz"]);
  });

  it("leaves the already planned slots intact", async () => {
    await putMeal("mon", "lunch", "Pâtes bolo");
    await putMeal("tue", "dinner", "Riz");
    await removeFromLibrary({ meal: "Pâtes bolo" });
    expect(await library()).toEqual(["Riz"]);
    expect(await plannedMeals()).toEqual(["Pâtes bolo", "Riz"]);
  });

  it("succeeds when the meal is not in the library", async () => {
    expect((await removeFromLibrary({ meal: "Inconnu" })).status).toBe(200);
  });

  it("re-enters the library when the meal is put in a slot again", async () => {
    await putMeal("mon", "lunch", "Riz");
    await removeFromLibrary({ meal: "Riz" });
    await putMeal("tue", "lunch", "Riz");
    expect(await library()).toEqual(["Riz"]);
  });

  it.each([{ meal: "" }, { meal: "  " }, { meal: 3 }, {}, "nope"])("rejects the body %j", async (body) => {
    expect((await removeFromLibrary(body)).status).toBe(400);
  });
});
