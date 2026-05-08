import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users } from '../data/mockData';

const defaultUser = users[0]; // multiplicador by default

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth ───────────────────────────────────────────────────────────────
      currentUser: defaultUser,
      isAuthenticated: true,
      login: (role) => {
        const roleMap = { admin: users[7], pastor: users[3], multiplicador: users[0] };
        set({ currentUser: roleMap[role] || users[0], isAuthenticated: true });
      },
      logout: () => set({ currentUser: null, isAuthenticated: false, sharedContent: [], completedMissions: [] }),

      // ── XP System ─────────────────────────────────────────────────────────
      addXP: (amount) => {
        const user = get().currentUser;
        if (!user) return;
        const newXP = user.xp + amount;
        const newLevel = Math.min(Math.floor(newXP / 500) + 1, 10);
        set({
          currentUser: { ...user, xp: newXP, level: newLevel },
          xpNotification: { show: true, amount },
        });
        setTimeout(() => set({ xpNotification: { show: false, amount: 0 } }), 2500);
      },
      xpNotification: { show: false, amount: 0 },

      // ── Sidebar ────────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      mobileSidebarOpen: false,
      setMobileSidebar: (v) => set({ mobileSidebarOpen: v }),

      // ── Content sharing ────────────────────────────────────────────────────
      sharedContent: [],
      shareContent: (contentId) => {
        const { sharedContent, addXP, currentUser } = get();
        if (!sharedContent.includes(contentId)) {
          set({
            sharedContent: [...sharedContent, contentId],
            currentUser: currentUser
              ? { ...currentUser, shared: (currentUser.shared || 0) + 1 }
              : currentUser,
          });
          addXP(50);
        }
      },

      // ── Missions ───────────────────────────────────────────────────────────
      completedMissions: [],
      completeMission: (missionId, xpReward) => {
        const { completedMissions, addXP, currentUser } = get();
        if (!completedMissions.includes(missionId)) {
          set({
            completedMissions: [...completedMissions, missionId],
            currentUser: currentUser
              ? { ...currentUser, missionsCompleted: (currentUser.missionsCompleted || 0) + 1 }
              : currentUser,
          });
          addXP(xpReward);
        }
      },

      // ── Notifications panel ────────────────────────────────────────────────
      notificationsOpen: false,
      setNotificationsOpen: (v) => set({ notificationsOpen: v }),
      toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
    }),
    {
      name: 'somos-mision-store-v2',
      // Only persist auth + sharing + missions; skip UI state
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        sharedContent: state.sharedContent,
        completedMissions: state.completedMissions,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
