import { create } from 'zustand';
export const useSquadStore = create((set) => ({
  items: [],
  setItems: (items: any[]) => set({ items }),
  reset: () => set({ items: [] }),
}));
export default useSquadStore;
