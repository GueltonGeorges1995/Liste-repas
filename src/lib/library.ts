// Clé de comparaison de la Bibliothèque : insensible à la casse et aux espaces de bord.
export const mealKey = (meal: string) => meal.trim().toLowerCase();

export function addToLibrary(library: string[], meal: string): void {
  const label = meal.trim();
  if (!library.some((m) => mealKey(m) === mealKey(label))) library.push(label);
}

export function removeFromLibrary(library: string[], meal: string): string[] {
  return library.filter((m) => mealKey(m) !== mealKey(meal));
}

export const sortLibrary = (library: string[]) =>
  [...library].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
