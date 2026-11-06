"use client";

import { useEffect, useRef, useState } from "react";
import { mealKey } from "@/lib/library";
import type { Item } from "@/lib/store";
import { onReturn } from "@/lib/refresh";

export function Shopping() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => onReturn(() => setReload((n) => n + 1)), []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shopping", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body) => {
        if (cancelled) return;
        setItems(body.items);
        setSuggestions(body.suggestions);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger la Liste de courses.");
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const busy = useRef(false);

  // Une seule requête d'écriture à la fois : évite les doublons par double appui.
  const send = async (url: string, init: RequestInit) => {
    if (busy.current) return false;
    busy.current = true;
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error();
      setError(null);
      setReload((n) => n + 1);
      return true;
    } catch {
      setError("L'enregistrement a échoué.");
      return false;
    } finally {
      busy.current = false;
    }
  };

  const add = async (label: string) => {
    if (!label.trim()) return;
    if (await send("/api/shopping", { method: "POST", body: JSON.stringify({ label }) })) {
      setDraft("");
      setShowSuggestions(false);
    }
  };

  const query = mealKey(draft);
  const matches = showSuggestions
    ? suggestions.filter((s) => mealKey(s).includes(query) && mealKey(s) !== query)
    : [];
  const hasChecked = items?.some((i) => i.checked) ?? false;
  const button = "rounded-lg border border-foreground/20 px-3 py-2 text-sm";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Courses</h1>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ajouter un article"
          aria-label="Nouvel article"
          className="min-w-0 flex-1 rounded-lg border border-foreground/30 bg-background px-3 py-2"
        />
        <button type="submit" className={button}>Ajouter</button>
        <button
          type="button"
          className={button}
          aria-pressed={showSuggestions}
          onClick={() => setShowSuggestions((v) => !v)}
        >
          Anciens articles
        </button>
        {matches.length > 0 && (
          <ul aria-label="Suggestions" className="w-full rounded-lg border border-foreground/15">
            {matches.map((label) => (
              <li key={label}>
                <button type="button" className="w-full px-3 py-2 text-left" onClick={() => void add(label)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {items === null ? (
        <p className="text-foreground/60">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-foreground/60">Rien à acheter.</p>
      ) : (
        <ul className="rounded-xl border border-foreground/15">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-1">
              <label className="flex flex-1 items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  className="size-5"
                  onChange={(e) =>
                    void send(`/api/shopping/${item.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ checked: e.target.checked }),
                    })
                  }
                />
                <span className={item.checked ? "text-foreground/40 line-through" : ""}>{item.label}</span>
              </label>
              <button
                className="px-3 py-2 text-foreground/50"
                aria-label={`Supprimer ${item.label}`}
                onClick={() => void send(`/api/shopping/${item.id}`, { method: "DELETE" })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasChecked && (
        <button className={button} onClick={() => void send("/api/shopping/checked", { method: "DELETE" })}>
          Retirer les cochés
        </button>
      )}
    </div>
  );
}
