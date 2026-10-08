const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000"

/**
 * Client HTTP de base avec gestion des erreurs.
 * Les credentials (cookies de session Better Auth) sont toujours envoyés.
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      (data as { message?: string }).message ??
      `Erreur HTTP ${response.status}`
    throw new Error(message)
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
}

