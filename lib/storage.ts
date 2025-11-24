const WEAK_LIST_KEY = 'weakList';

export function getWeakList(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WEAK_LIST_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToWeakList(id: string): void {
  if (typeof window === 'undefined') return;
  const weakList = getWeakList();
  if (!weakList.includes(id)) {
    weakList.push(id);
    localStorage.setItem(WEAK_LIST_KEY, JSON.stringify(weakList));
  }
}

export function clearWeakList(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WEAK_LIST_KEY);
}


