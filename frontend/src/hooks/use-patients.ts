import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Patient, PatientInput, PatientsResponse } from "@/zod-schemas/patients"

export const patientsKey = ["patients"] as const

export function usePatients(page: number, limit: number, search: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set("search", search)
  return useQuery({
    queryKey: [...patientsKey, page, limit, search],
    queryFn: () => api.get<PatientsResponse>(`/patients?${params.toString()}`),
  })
}

export function useUpdatePatient(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: PatientInput) => api.put<{ message?: string }>(`/patients/${id}`, data),
    onSuccess: () => client.invalidateQueries({ queryKey: patientsKey }),
  })
}

export function useDeletePatient() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message?: string }>(`/patients/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: patientsKey }),
  })
}

export function useSetPatientBan() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; banned: boolean }) =>
      api.post<{ success: boolean; message: string }>(`/patients/${data.id}/${data.banned ? "ban" : "unban"}`, {}),
    onSuccess: () => client.invalidateQueries({ queryKey: patientsKey }),
  })
}

export function useUnassignedPatients(search: string) {
  return useQuery({
    queryKey: [...patientsKey, "unassigned", search],
    queryFn: () => api.get<{ success: boolean; patients: Array<{ id: string; userId: string; name: string; email: string }> }>(`/patients/unassigned?${new URLSearchParams({ search })}`),
    enabled: search.trim().length >= 3,
  })
}

export function useAssignPatient() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<{ success: boolean; message: string }>(`/patients/${id}/assign`, {}),
    onSuccess: () => client.invalidateQueries({ queryKey: patientsKey }),
  })
}

export function patientName(patient: Patient) {
  return patient.user?.name || "Patient"
}
