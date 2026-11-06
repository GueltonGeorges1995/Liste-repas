import { randomUUID } from "node:crypto";
import { addToLibrary, sortLibrary } from "@/lib/library";
import { dataFilePath, readData, updateData } from "@/lib/store";

export async function GET() {
  const { shopping, shoppingHistory } = await readData(dataFilePath());
  return Response.json({ items: shopping, suggestions: sortLibrary(shoppingHistory) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  if (!label) return Response.json({ error: "Libellé de l'Article manquant" }, { status: 400 });

  const item = { id: randomUUID(), label, checked: false };
  await updateData(dataFilePath(), (data) => {
    data.shopping.push(item);
    addToLibrary(data.shoppingHistory, label);
  });
  return Response.json(item, { status: 201 });
}
