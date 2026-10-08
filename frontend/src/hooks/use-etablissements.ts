import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  CreateEtablissementInput,
  DeleteEtablissementResponse,
  Etablissement,
  EtablissementMutationResponse,
  GetEtablissementsResponse,
  UpdateEtablissementInput,
} from "@/zod-schemas/etablissements"

// ---- Clés de cache React Query ----

export const etablissementsKeys = {
  all: ["etablissements"] as const,
  list: (filters: EtablissementFilters) => ["etablissements", "list", filters] as const,
  detail: (id: string) => ["etablissements", "detail", id] as const,
}

export interface EtablissementFilters {
  page?: number
  limit?: number
  search?: string
}

// ---- useEtablissements : lister avec pagination + recherche ----

export function useEtablissements(filters: EtablissementFilters = {}) {
  const { page = 1, limit = 10, search } = filters

  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (search) params.set("search", search)

  return useQuery<GetEtablissementsResponse>({
    queryKey: etablissementsKeys.list(filters),
    queryFn: () =>
      api.get<GetEtablissementsResponse>(`/etablissements?${params.toString()}`),
  })
}

// ---- useEtablissementById : détail par ID ----

export function useEtablissementById(id: string | null) {
  return useQuery<Etablissement>({
    queryKey: etablissementsKeys.detail(id!),
    queryFn: async () => {
      const res = await api.get<{ success: boolean; etablissement: Etablissement }>(
        `/etablissements/${id}`,
      )
      return res.etablissement
    },
    enabled: !!id,
  })
}

// ---- useCreateEtablissement ----

export function useCreateEtablissement() {
  const queryClient = useQueryClient()

  return useMutation<EtablissementMutationResponse, Error, CreateEtablissementInput>({
    mutationFn: (data) =>
      api.post<EtablissementMutationResponse>("/etablissements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: etablissementsKeys.all })
    },
  })
}

// ---- useUpdateEtablissement ----

export function useUpdateEtablissement(id: string) {
  const queryClient = useQueryClient()

  return useMutation<
    EtablissementMutationResponse,
    Error,
    UpdateEtablissementInput
  >({
    mutationFn: (data) =>
      api.put<EtablissementMutationResponse>(`/etablissements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: etablissementsKeys.all })
      queryClient.invalidateQueries({
        queryKey: etablissementsKeys.detail(id),
      })
    },
  })
}

// ---- useDeleteEtablissement ----

export function useDeleteEtablissement() {
  const queryClient = useQueryClient()

  return useMutation<DeleteEtablissementResponse, Error, string>({
    mutationFn: (id) =>
      api.delete<DeleteEtablissementResponse>(`/etablissements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: etablissementsKeys.all })
    },
  })
}

