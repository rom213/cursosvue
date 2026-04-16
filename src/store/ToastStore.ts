import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'gift' | 'guarantee';

export interface ToastItem {
  id: string;
  type: ToastType;
}

export const toastStore = defineStore('toastStore', () => {
  const items = ref<ToastItem[]>([]);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function add(type: ToastType, autoDismissMs?: number): string {
    const existing = items.value.find(t => t.type === type);
    if (existing) return existing.id;

    const id = `${type}-${Math.random().toString(36).slice(2, 8)}`;
    items.value.push({ id, type });

    if (autoDismissMs && autoDismissMs > 0) {
      const tid = setTimeout(() => dismiss(id), autoDismissMs);
      timers.set(id, tid);
    }
    return id;
  }

  function dismiss(id: string): void {
    const idx = items.value.findIndex(t => t.id === id);
    if (idx >= 0) items.value.splice(idx, 1);
    const tid = timers.get(id);
    if (tid) {
      clearTimeout(tid);
      timers.delete(id);
    }
  }

  function dismissByType(type: ToastType): void {
    items.value
      .filter(t => t.type === type)
      .map(t => t.id)
      .forEach(dismiss);
  }

  return { items, add, dismiss, dismissByType };
});
