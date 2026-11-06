import { dataFilePath, readData } from "@/lib/store";
import { isWeekStart, weekSlots } from "@/lib/week";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ weekStart: string }> },
) {
  const { weekStart } = await params;
  if (!isWeekStart(weekStart)) {
    return Response.json({ error: "Semaine invalide" }, { status: 400 });
  }
  const data = await readData(dataFilePath());
  return Response.json({ weekStart, slots: weekSlots(data.weeks[weekStart]) });
}
