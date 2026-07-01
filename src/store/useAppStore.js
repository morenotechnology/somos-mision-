import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError } from '../api';

const PROFILE_XP_GATE = 100;

function profileNeedsCompletion(user) {
  return Boolean(user && !user.profileComplete && Number(user.xp || 0) >= PROFILE_XP_GATE);
}

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
          sharedContent: payload?.sharedContentIds || [],
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
        const { currentUser, sharedContent, showXP } = get();
        if (profileNeedsCompletion(currentUser)) {
          throw new ApiError('Completa tu perfil para seguir sumando XP después de los 100 puntos.', 403, {
            code: 'PROFILE_REQUIRED',
          });
        }
        const payload = await api.content.share(contentId, { red_social: socialNetwork, ...evidence });
        set({
          currentUser: payload.user,
          isAuthenticated: Boolean(payload.user),
          sharedContent: payload.sharedContentIds || sharedContent,
          completedMissions: payload.completedMissionIds || get().completedMissions,
        });
        if ((payload.share?.xp_ganado ?? xpReward) > 0) showXP(payload.share?.xp_ganado ?? xpReward);
        return payload;
      },

      completeMission: async (missionId, xpReward = 0) => {
        const { currentUser, completedMissions, showXP } = get();
        if (completedMissions.includes(missionId)) return { alreadyCompleted: true };
        if (profileNeedsCompletion(currentUser)) {
          throw new ApiError('Completa tu perfil para seguir sumando XP después de los 100 puntos.', 403, {
            code: 'PROFILE_REQUIRED',
          });
        }
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
