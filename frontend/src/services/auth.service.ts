import { apiFetch, setToken, removeToken, getToken } from "../lib/api";
import { AuthResponse, LoginCredentials, User } from "../types/auth";


export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    

    const response = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const token = response.accessToken || response.access_token;
    if (token) {
      setToken(token);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("im_user", JSON.stringify(response.user));
    }
    return response;
  },

  logout(): void {
    removeToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("im_user");
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("im_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};
