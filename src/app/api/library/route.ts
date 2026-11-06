import { removeFromLibrary, sortLibrary } from "@/lib/library";
import { dataFilePath, readData, updateData } from "@/lib/store";

export async function GET() {
  const { library } = await readData(dataFilePath());
  return Response.json({ meals: sortLibrary(library) });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const meal = typeof body?.meal === "string" ? body.meal.trim() : "";
  if (!meal) return Response.json({ error: "Libellé du Repas manquant" }, { status: 400 });

  await updateData(dataFilePath(), (data) => {
    data.library = removeFromLibrary(data.library, meal);
  });
  return Response.json({ meal });
}
