import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as getWeekRoute } from "../../route";
import { DELETE, PUT } from "./route";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "repas-slot-"));
  process.env.DATA_FILE = join(dir, "data.json");
});
afterEach(async () => {
  delete process.env.DATA_FILE;
  await rm(dir, { recursive: true, force: true });
});

const WEEK = "2026-10-26";

const slotParams = (day: string, moment: string, weekStart = WEEK) => ({
  params: Promise.resolve({ weekStart, day, moment }),
});

const putMeal = (day: string, moment: string, body: unknown, weekStart = WEEK) =>
  PUT(
    new Request("http://test", { method: "PUT", body: JSON.stringify(body) }),
    slotParams(day, moment, weekStart),
  );

const clearSlot = (day: string, moment: string, weekStart = WEEK) =>
  DELETE(new Request("http://test", { method: "DELETE" }), slotParams(day, moment, weekStart));

const readWeek = async (weekStart = WEEK) => {
  const res = await getWeekRoute(new Request("http://test"), {
    params: Promise.resolve({ weekStart }),
  });
  return (await res.json()).slots as { day: string; moment: string; meal: string | null }[];
};

const mealAt = async (day: string, moment: string, weekStart = WEEK) =>
  (await readWeek(weekStart)).find((s) => s.day === day && s.moment === moment)?.meal;

describe("PUT /api/weeks/[weekStart]/[day]/[moment]", () => {
  it("puts a meal in a slot, and it is read back afterwards", async () => {
    const res = await putMeal("tue", "dinner", { meal: "Pâtes bolo" });
    expect(res.status).toBe(200);
    expect(await mealAt("tue", "dinner")).toBe("Pâtes bolo");
    expect(await mealAt("tue", "lunch")).toBeNull();
  });

  it("replaces the meal when the slot is already filled: a slot never holds two meals", async () => {
    await putMeal("mon", "lunch", { meal: "Riz" });
    await putMeal("mon", "lunch", { meal: "Salade" });
    expect(await mealAt("mon", "lunch")).toBe("Salade");
    const filled = (await readWeek()).filter((s) => s.meal !== null);
    expect(filled).toEqual([{ day: "mon", moment: "lunch", meal: "Salade" }]);
  });

  it("treats Restau like any other meal", async () => {
    await putMeal("sat", "dinner", { meal: "Restau" });
    expect(await mealAt("sat", "dinner")).toBe("Restau");
  });

  it("keeps weeks independent of each other", async () => {
    await putMeal("mon", "lunch", { meal: "Riz" });
    expect(await mealAt("mon", "lunch", "2026-11-02")).toBeNull();
  });
});

describe("DELETE /api/weeks/[weekStart]/[day]/[moment]", () => {
  it("empties a filled slot and leaves the others untouched", async () => {
    await putMeal("wed", "lunch", { meal: "Soupe" });
    await putMeal("wed", "dinner", { meal: "Quiche" });
    const res = await clearSlot("wed", "lunch");
    expect(res.status).toBe(200);
    expect(await mealAt("wed", "lunch")).toBeNull();
    expect(await mealAt("wed", "dinner")).toBe("Quiche");
  });

  it("succeeds on an already empty slot", async () => {
    expect((await clearSlot("thu", "dinner")).status).toBe(200);
    expect(await mealAt("thu", "dinner")).toBeNull();
  });
});

describe("input validation", () => {
  it.each([
    ["an unknown day", "xyz", "lunch", "2026-10-26"],
    ["an unknown moment", "mon", "brunch", "2026-10-26"],
    ["a week that does not start on a Monday", "mon", "lunch", "2026-10-27"],
  ])("rejects %s on PUT and DELETE", async (_label, day, moment, weekStart) => {
    expect((await putMeal(day, moment, { meal: "Riz" }, weekStart)).status).toBe(400);
    expect((await clearSlot(day, moment, weekStart)).status).toBe(400);
  });

  it.each([{ meal: "" }, { meal: "   " }, { meal: 42 }, {}, "not an object"])(
    "rejects the body %j and leaves the slot as it was",
    async (body) => {
      await putMeal("mon", "lunch", { meal: "Riz" });
      expect((await putMeal("mon", "lunch", body)).status).toBe(400);
      expect(await mealAt("mon", "lunch")).toBe("Riz");
    },
  );

  it("rejects a body that is not JSON", async () => {
    const res = await PUT(
      new Request("http://test", { method: "PUT", body: "{oops" }),
      slotParams("mon", "lunch"),
    );
    expect(res.status).toBe(400);
  });

  it("trims the meal label", async () => {
    await putMeal("mon", "lunch", { meal: "  Riz  " });
    expect(await mealAt("mon", "lunch")).toBe("Riz");
  });
});

describe("simultaneous requests", () => {
  it("keeps every change when different slots are written at the same time", async () => {
    await Promise.all([
      putMeal("mon", "lunch", { meal: "Riz" }),
      putMeal("tue", "lunch", { meal: "Pâtes" }),
      putMeal("wed", "lunch", { meal: "Soupe" }),
      putMeal("thu", "lunch", { meal: "Quiche" }),
      putMeal("fri", "lunch", { meal: "Pizza" }),
    ]);
    const meals = (await readWeek()).filter((s) => s.meal !== null).map((s) => s.meal);
    expect(meals).toEqual(["Riz", "Pâtes", "Soupe", "Quiche", "Pizza"]);
  });
});
