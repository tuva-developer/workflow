export const ACCESS_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  setAccess: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (refresh: string) => localStorage.setItem(REFRESH_KEY, refresh),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
