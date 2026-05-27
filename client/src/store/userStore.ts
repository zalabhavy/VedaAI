import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  name: string;
  email: string;
  notifications: boolean;
  darkMode: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: 'John Doe',
      email: 'john@dps.edu',
      notifications: true,
      darkMode: false,
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'vedaai-user' }
  )
);
