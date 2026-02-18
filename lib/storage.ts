const WEAK_LIST_KEY = 'weakList';

export function getWeakList(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WEAK_LIST_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(WEAK_LIST_KEY);
      return [];
    }
    return parsed;
  } catch {
    localStorage.removeItem(WEAK_LIST_KEY);
    return [];
  }
}

export function addToWeakList(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const weakList = getWeakList();
    if (!weakList.includes(id)) {
      weakList.push(id);
      localStorage.setItem(WEAK_LIST_KEY, JSON.stringify(weakList));
    }
  } catch {
    // Storage full or unavailable
  }
}

export function clearWeakList(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(WEAK_LIST_KEY);
  } catch {
    // Storage unavailable
  }
}
