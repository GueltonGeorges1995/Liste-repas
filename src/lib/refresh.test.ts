import { describe, expect, it, vi } from "vitest";
import { onReturn } from "./refresh";

const fakeDoc = (state: "visible" | "hidden") => {
  const target = new EventTarget();
  return Object.assign(target, { visibilityState: state }) as EventTarget & { visibilityState: string };
};

describe("onReturn", () => {
  it("relit quand l'onglet redevient visible", () => {
    const doc = fakeDoc("hidden");
    const win = new EventTarget();
    const cb = vi.fn();
    onReturn(cb, doc, win);
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(cb).not.toHaveBeenCalled();
    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("relit quand la fenêtre reprend le focus", () => {
    const win = new EventTarget();
    const cb = vi.fn();
    onReturn(cb, fakeDoc("visible"), win);
    win.dispatchEvent(new Event("focus"));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("cesse d'écouter après désabonnement", () => {
    const win = new EventTarget();
    const cb = vi.fn();
    const stop = onReturn(cb, fakeDoc("visible"), win);
    stop();
    win.dispatchEvent(new Event("focus"));
    expect(cb).not.toHaveBeenCalled();
  });

  it("ne relit qu'une fois quand focus et visibilité arrivent ensemble", () => {
    const doc = fakeDoc("visible");
    const win = new EventTarget();
    const cb = vi.fn();
    onReturn(cb, doc, win);
    doc.dispatchEvent(new Event("visibilitychange"));
    win.dispatchEvent(new Event("focus"));
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
