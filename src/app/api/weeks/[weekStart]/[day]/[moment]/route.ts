import { addToLibrary } from "@/lib/library";
import { dataFilePath, updateData } from "@/lib/store";
import { DAYS, isWeekStart, MOMENTS, type Day, type Moment } from "@/lib/week";

type Ctx = { params: Promise<{ weekStart: string; day: string; moment: string }> };

const badRequest = (error: string) => Response.json({ error }, { status: 400 });

async function parseSlot({ params }: Ctx) {
  const { weekStart, day, moment } = await params;
  if (!isWeekStart(weekStart)) return null;
  if (!DAYS.includes(day as Day) || !MOMENTS.includes(moment as Moment)) return null;
  return { weekStart, day: day as Day, moment: moment as Moment };
}

export async function PUT(req: Request, ctx: Ctx) {
  const slot = await parseSlot(ctx);
  if (!slot) return badRequest("Créneau invalide");

  const body = await req.json().catch(() => null);
  const meal = typeof body?.meal === "string" ? body.meal.trim() : "";
  if (!meal) return badRequest("Libellé du Repas manquant");

  await updateData(dataFilePath(), (data) => {
    const week = (data.weeks[slot.weekStart] ??= {});
    (week[slot.day] ??= {})[slot.moment] = meal;
    addToLibrary(data.library, meal);
  });
  return Response.json({ ...slot, meal });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const slot = await parseSlot(ctx);
  if (!slot) return badRequest("Créneau invalide");

  await updateData(dataFilePath(), (data) => {
    const week = data.weeks[slot.weekStart];
    const day = week?.[slot.day];
    if (!week || !day) return;
    delete day[slot.moment];
    if (Object.keys(day).length === 0) delete week[slot.day];
    if (Object.keys(week).length === 0) delete data.weeks[slot.weekStart];
  });
  return Response.json({ ...slot, meal: null });
}
