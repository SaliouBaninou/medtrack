import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Doctor {
  id: string
  userId: string
  specialty: string
  department: string
  professionalId: string | null
  phone: string | null
  status: "active" | "inactive" | "suspended"
  etablissementId: string
  created_at: string
  user: { id: string; name: string; email: string; banned?: boolean | null; banReason?: string | null }
}

export interface DoctorAccountMatch {
  id: string
  name: string
  email: string
}

export function useDoctors(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ["doctors", page, limit, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search.trim()) params.set("search", search.trim())
      return api.get<{
        success: boolean
        doctors: Doctor[]
        etablissement: { id: string; name: string } | null
        pagination: { currentPage: number; perPage: number; totalItems: number; totalPages: number }
      }>(`/doctors?${params}`)
    },
  })
}

export function useDoctorAccountSearch(search: string) {
  return useQuery({
    queryKey: ["doctor-account-search", search],
    queryFn: () => api.get<{ success: boolean; users: DoctorAccountMatch[] }>(`/doctors/users?${new URLSearchParams({ search })}`),
    enabled: search.trim().length >= 3,
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      userId: string
      specialty: string
      department: string
      professionalId?: string
      phone?: string
      status: Doctor["status"]
    }) => api.post<{ success: boolean; message: string; doctor: Doctor }>("/doctors", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  })
}

export function useUpdateDoctor() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; specialty: string; department: string; professionalId?: string; phone?: string; status: Doctor["status"] }) => api.put(`/doctors/${id}`, data),
    onSuccess: () => client.invalidateQueries({ queryKey: ["doctors"] }),
  })
}

export function useSetDoctorBan() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => api.patch(`/doctors/${id}/ban`, { banned }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["doctors"] }),
  })
}

export function useDeleteDoctor() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: ["doctors"] }),
  })
}
