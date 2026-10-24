import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface HospitalAdmin {
  id: string
  userId: string
  etablissementId: string
  profession: string
  telephone: string
  created_at: string
  name: string
  email: string
  banned: boolean | null
  banReason: string | null
}

export interface AdminAccountMatch {
  id: string
  name: string
  email: string
}

interface Pagination {
  currentPage: number
  perPage: number
  totalItems: number
  totalPages: number
}

export function useHospitalAdmins(
  etablissementId: string,
  page: number,
  limit: number,
  search: string,
) {
  return useQuery({
    queryKey: ["hospital-admins", etablissementId, page, limit, search],
    queryFn: () => {
      const params = new URLSearchParams({ etablissementId, page: String(page), limit: String(limit) })
      if (search.trim()) params.set("search", search.trim())
      return api.get<{ success: boolean; admins: HospitalAdmin[]; pagination: Pagination }>(`/hospital-admins?${params}`)
    },
    enabled: !!etablissementId,
  })
}

export function useAdminAccountSearch(search: string) {
  return useQuery({
    queryKey: ["hospital-admin-account-search", search],
    queryFn: () => api.get<{ success: boolean; users: AdminAccountMatch[] }>(`/hospital-admins/users?${new URLSearchParams({ search })}`),
    enabled: search.trim().length >= 3,
  })
}

export function useCreateHospitalAdmin(etablissementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string; etablissementId: string; profession: string; telephone: string }) =>
      api.post<{ success: boolean; message: string; admin: HospitalAdmin }>("/hospital-admins", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hospital-admins", etablissementId] }),
  })
}

export function useUpdateHospitalAdmin(etablissementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; profession: string; telephone: string }) =>
      api.put<{ success: boolean; message: string }>(`/hospital-admins/${data.id}`, {
        profession: data.profession,
        telephone: data.telephone,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hospital-admins", etablissementId] }),
  })
}

export function useSetHospitalAdminBan(etablissementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; banned: boolean }) =>
      api.post<{ success: boolean; message: string }>(`/hospital-admins/${data.id}/${data.banned ? "ban" : "unban"}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hospital-admins", etablissementId] }),
  })
}

export function useDeleteHospitalAdmin(etablissementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean; message: string }>(`/hospital-admins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hospital-admins", etablissementId] }),
  })
}
