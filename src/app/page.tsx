import { Suspense } from "react";
import { connection } from "next/server";
import { Planning } from "@/components/planning";

// La Semaine courante dépend de l'heure : l'écran est rendu à la demande, jamais prérendu.
async function CurrentPlanning() {
  await connection();
  return <Planning />;
}

export default function PlanningPage() {
  return (
    <Suspense fallback={<p className="text-foreground/60">Chargement…</p>}>
      <CurrentPlanning />
    </Suspense>
  );
}
