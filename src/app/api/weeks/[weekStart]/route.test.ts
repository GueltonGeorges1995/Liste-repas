import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "./route";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "repas-weeks-"));
  process.env.DATA_FILE = join(dir, "data.json");
});
afterEach(async () => {
  delete process.env.DATA_FILE;
  await rm(dir, { recursive: true, force: true });
});

const getWeek = (weekStart: string) =>
  GET(new Request(`http://test/api/weeks/${weekStart}`), {
    params: Promise.resolve({ weekStart }),
  });

describe("GET /api/weeks/[weekStart]", () => {
  it("reads a week absent from the file as 14 empty slots, Monday to Sunday", async () => {
    const res = await getWeek("2026-10-26");
    expect(res.status).toBe(200);
    const week = await res.json();
    expect(week.weekStart).toBe("2026-10-26");
    expect(week.slots).toHaveLength(14);
    expect(week.slots.slice(0, 2)).toEqual([
      { day: "mon", moment: "lunch", meal: null },
      { day: "mon", moment: "dinner", meal: null },
    ]);
    expect(week.slots[13]).toEqual({ day: "sun", moment: "dinner", meal: null });
    expect(week.slots.every((s: { meal: unknown }) => s.meal === null)).toBe(true);
  });

  it.each(["abc", "2026-13-01", "2026-10-27"])(
    "rejects %s, which is not the start date of a Monday-to-Sunday week",
    async (weekStart) => {
      expect((await getWeek(weekStart)).status).toBe(400);
    },
  );
});
