"use client";

import { useEffect, useState } from "react";
import {
  currentWeekStart,
  dayDate,
  DAYS,
  shiftWeek,
  type Day,
  type Moment,
  type Slot,
} from "@/lib/week";

const DAY_LABELS: Record<Day, string> = {
  mon: "Lundi",
  tue: "Mardi",
  wed: "Mercredi",
  thu: "Jeudi",
  fri: "Vendredi",
  sat: "Samedi",
  sun: "Dimanche",
};
const MOMENT_LABELS: Record<Moment, string> = { lunch: "Midi", dinner: "Soir" };

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

const slotUrl = (weekStart: string, day: Day, moment: Moment) =>
  `/api/weeks/${weekStart}/${day}/${moment}`;

export function Planning() {
  const [weekStart, setWeekStart] = useState(() => currentWeekStart());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ day: Day; moment: Moment } | null>(null);
  const [draft, setDraft] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/weeks/${weekStart}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body) => {
        if (cancelled) return;
        setSlots(body.slots);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger la Semaine.");
      });
    return () => {
      cancelled = true;
    };
  }, [weekStart, reload]);

  const goTo = (week: string) => {
    setSlots(null);
    setEditing(null);
    setWeekStart(week);
  };

  const send = async (day: Day, moment: Moment, meal: string | null) => {
    const res = await fetch(slotUrl(weekStart, day, moment), {
      method: meal === null ? "DELETE" : "PUT",
      body: meal === null ? undefined : JSON.stringify({ meal }),
    });
    if (!res.ok) {
      setError("L'enregistrement a échoué.");
      return;
    }
    setEditing(null);
    setReload((n) => n + 1);
  };

  const startEdit = (slot: Slot) => {
    setEditing({ day: slot.day, moment: slot.moment });
    setDraft(slot.meal ?? "");
  };

  const isCurrent = weekStart === currentWeekStart();
  const button = "rounded-lg border border-foreground/20 px-3 py-2 text-sm";

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <button className={button} onClick={() => goTo(shiftWeek(weekStart, -1))} aria-label="Semaine précédente">
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            {formatDate(weekStart)} – {formatDate(dayDate(weekStart, "sun"))}
          </h1>
          {!isCurrent && (
            <button className="text-sm underline" onClick={() => goTo(currentWeekStart())}>
              Cette semaine
            </button>
          )}
        </div>
        <button className={button} onClick={() => goTo(shiftWeek(weekStart, 1))} aria-label="Semaine suivante">
          →
        </button>
      </header>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {slots === null ? (
        <p className="text-foreground/60">Chargement…</p>
      ) : (
        DAYS.map((day) => (
          <section key={day} className="rounded-xl border border-foreground/15">
            <h2 className="border-b border-foreground/15 px-3 py-2 font-medium">
              {DAY_LABELS[day]} <span className="text-foreground/50">{formatDate(dayDate(weekStart, day))}</span>
            </h2>
            <ul>
              {slots
                .filter((s) => s.day === day)
                .map((slot) => {
                  const isEditing = editing?.day === slot.day && editing.moment === slot.moment;
                  return (
                    <li key={slot.moment} className="flex items-center gap-3 px-3 py-2">
                      <span className="w-12 shrink-0 text-sm text-foreground/60">{MOMENT_LABELS[slot.moment]}</span>
                      {isEditing ? (
                        <form
                          className="flex flex-1 flex-wrap gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (draft.trim()) void send(slot.day, slot.moment, draft.trim());
                          }}
                        >
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Repas"
                            aria-label={`Repas ${DAY_LABELS[slot.day]} ${MOMENT_LABELS[slot.moment]}`}
                            className="min-w-0 flex-1 rounded-lg border border-foreground/30 bg-background px-3 py-2"
                          />
                          <button type="submit" className={button}>OK</button>
                          {slot.meal !== null && (
                            <button type="button" className={button} onClick={() => void send(slot.day, slot.moment, null)}>
                              Vider
                            </button>
                          )}
                          <button type="button" className={button} onClick={() => setEditing(null)}>
                            Annuler
                          </button>
                        </form>
                      ) : (
                        <button
                          className="flex-1 py-1 text-left"
                          onClick={() => startEdit(slot)}
                        >
                          {slot.meal ?? <span className="text-foreground/40">+ Ajouter</span>}
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
