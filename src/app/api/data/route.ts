import { dataFilePath, readData } from "@/lib/store";

export async function GET() {
  return Response.json(await readData(dataFilePath()));
}
