import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import type { Week } from "./week";

export type Data = {
  weeks: Record<string, Week>;
  library: string[];
  shopping: unknown[];
};

export const emptyData = (): Data => ({ weeks: {}, library: [], shopping: [] });

export async function readData(path: string): Promise<Data> {
  try {
    return { ...emptyData(), ...JSON.parse(await readFile(path, "utf8")) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return emptyData();
    throw e;
  }
}

// Écriture atomique : fichier temporaire puis renommage, jamais de fichier tronqué.
export async function writeData(path: string, data: Data): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const tmp = `${path}.${randomUUID()}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(tmp, json);
    await rename(tmp, path);
  } catch (e) {
    await rm(tmp, { force: true });
    throw e;
  }
}

// Sérialise les cycles lecture-modification-écriture : sans cela, deux requêtes
// simultanées liraient le même état et la seconde écriture effacerait la première.
let queue: Promise<unknown> = Promise.resolve();

export function updateData<T>(path: string, change: (data: Data) => T): Promise<T> {
  const run = queue.then(async () => {
    const data = await readData(path);
    const result = change(data);
    await writeData(path, data);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

// Chemin configurable via DATA_FILE ; par défaut `data/repas.json` (ignoré par git).
export const dataFilePath = () =>
  process.env.DATA_FILE ?? join(process.cwd(), "data", "repas.json");
