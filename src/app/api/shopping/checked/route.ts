import { dataFilePath, updateData } from "@/lib/store";

export async function DELETE() {
  await updateData(dataFilePath(), (data) => {
    data.shopping = data.shopping.filter((i) => !i.checked);
  });
  return Response.json({ ok: true });
}
