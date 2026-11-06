import { dataFilePath, updateData } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.checked !== "boolean") {
    return Response.json({ error: "État coché manquant" }, { status: 400 });
  }

  const item = await updateData(dataFilePath(), (data) => {
    const found = data.shopping.find((i) => i.id === id);
    if (found) found.checked = body.checked;
    return found;
  });
  if (!item) return Response.json({ error: "Article introuvable" }, { status: 404 });
  return Response.json(item);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await updateData(dataFilePath(), (data) => {
    data.shopping = data.shopping.filter((i) => i.id !== id);
  });
  return Response.json({ id });
}
