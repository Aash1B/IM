export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class CustomApiError extends Error {
  statusCode: number;
  errorDetails?: string;

  constructor(statusCode: number, message: string, errorDetails?: string) {
    super(message);
    this.name = "CustomApiError";
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
  }
}

// Token helper abstractions
const TOKEN_KEY = "im_ops_access_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMsg = "Request failed";
      if (typeof data?.message === "string") {
        errorMsg = data.message;
      } else if (Array.isArray(data?.message)) {
        errorMsg = data.message.join(", ");
      } else if (data?.message && typeof data.message === "object") {
        errorMsg = data.message.message || JSON.stringify(data.message);
      } else if (response.statusText) {
        errorMsg = response.statusText;
      }

      if (response.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
        removeToken();
        localStorage.removeItem("im_user");
        window.location.href = "/login";
      }

      throw new CustomApiError(response.status, errorMsg, typeof data?.error === "string" ? data.error : undefined);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof CustomApiError) {
      throw err;
    }
    const msg = typeof err?.message === "string" ? err.message : "Network Error";
    throw new CustomApiError(500, msg);
  }
}
