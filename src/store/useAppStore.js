import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api';

export const useAppStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      session: null,
      isAuthenticated: false,
      authReady: false,
      sharedContent: [],
      completedMissions: [],
      xpNotification: { show: false, amount: 0 },

      loginFromApi: (payload) => {
        set({
          currentUser: payload?.user || null,
          session: payload?.session || null,
          isAuthenticated: Boolean(payload?.user),
          sharedContent: (payload?.sharedContentIds || []).map(String),
          completedMissions: payload?.completedMissionIds || [],
        });
      },

      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: Boolean(user) }),
      setAuthReady: (authReady) => set({ authReady }),

      bootstrapAuth: async () => {
        try {
          const payload = await api.auth.getSession();
          if (payload?.user) {
            get().loginFromApi(payload);
          } else {
            set({ currentUser: null, session: null, isAuthenticated: false, sharedContent: [], completedMissions: [] });
          }
        } catch {
          set({ currentUser: null, session: null, isAuthenticated: false, sharedContent: [], completedMissions: [] });
        } finally {
          set({ authReady: true });
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } finally {
          set({
            currentUser: null,
            session: null,
            isAuthenticated: false,
            sharedContent: [],
            completedMissions: [],
            authReady: true,
          });
        }
      },

      showXP: (amount) => {
        set({ xpNotification: { show: true, amount } });
        window.clearTimeout(get().xpTimer);
        const timer = window.setTimeout(() => set({ xpNotification: { show: false, amount: 0 }, xpTimer: null }), 2500);
        set({ xpTimer: timer });
      },

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      mobileSidebarOpen: false,
      setMobileSidebar: (value) => set({ mobileSidebarOpen: value }),

      shareContent: async (contentId, xpReward = 50, socialNetwork = 'whatsapp', evidence = {}) => {
        const { sharedContent, showXP } = get();
        const payload = await api.content.share(contentId, { red_social: socialNetwork, ...evidence });
        const nextSharedContent = payload.sharedContentIds?.length
          ? payload.sharedContentIds.map(String)
          : [...new Set([...sharedContent.map(String), String(contentId)])];
        set({
          currentUser: payload.user,
          isAuthenticated: Boolean(payload.user),
          sharedContent: nextSharedContent,
          completedMissions: payload.completedMissionIds || get().completedMissions,
        });
        if ((payload.share?.xp_ganado ?? xpReward) > 0) showXP(payload.share?.xp_ganado ?? xpReward);
        return payload;
      },

      completeMission: async (missionId, xpReward = 0) => {
        const { completedMissions, showXP } = get();
        if (completedMissions.includes(missionId)) return { alreadyCompleted: true };
        const payload = await api.missions.complete(missionId);
        set({
          currentUser: payload.user,
          isAuthenticated: Boolean(payload.user),
          completedMissions: payload.completedMissionIds || completedMissions,
        });
        if ((payload.completion?.xp_ganado ?? xpReward) > 0) showXP(payload.completion?.xp_ganado ?? xpReward);
        return payload;
      },

      notificationsOpen: false,
      setNotificationsOpen: (value) => set({ notificationsOpen: value }),
      toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
    }),
    {
      name: 'somos-mision-store-v3',
      partialize: (state) => ({
        currentUser: state.currentUser,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        sharedContent: state.sharedContent,
        completedMissions: state.completedMissions,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
