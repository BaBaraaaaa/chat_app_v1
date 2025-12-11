import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    displayName?: string,
  ) => {
    const res = await api.post(
      "/auth/register",
      { username, password, email, displayName },
      {withCredentials: true}
    );
    return res.data;
  },
  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "/auth/login",
      { username, password },
      {
        // headers: {
        //   "Content-Type": "application/json",
        // },
        withCredentials: true,
      }
    );
    return res.data;
  },
  signOut: async () => {
    const res = await api.post("/auth/logout", {}, { withCredentials: true });
    return res.data;
  },
  fetchMe: async () => {
    const res = await api.get("/user/me", { withCredentials: true });
    return res.data.user;
  },
  refresh: async () => {
    const res = await api.post(
      "/auth/refresh-token",
      {},
      { withCredentials: true }
    );
    return res.data.accessToken;
  },
};
