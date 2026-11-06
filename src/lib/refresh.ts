type Source = Pick<EventTarget, "addEventListener" | "removeEventListener">;

// Appelle `refresh` au retour sur l'onglet ou l'application. Renvoie la fonction de désabonnement.
export function onReturn(
  refresh: () => void,
  doc: Source & { visibilityState: string } = document,
  win: Source = window,
): () => void {
  // Au retour, `visibilitychange` et `focus` arrivent ensemble : une seule relecture.
  let last = -Infinity;
  const fire = () => {
    const now = Date.now();
    if (now - last < 1000) return;
    last = now;
    refresh();
  };
  const onVisibility = () => {
    if (doc.visibilityState === "visible") fire();
  };
  doc.addEventListener("visibilitychange", onVisibility);
  win.addEventListener("focus", fire);
  return () => {
    doc.removeEventListener("visibilitychange", onVisibility);
    win.removeEventListener("focus", fire);
  };
}
