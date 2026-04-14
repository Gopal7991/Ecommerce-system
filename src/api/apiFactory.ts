import apiClient from "./axios";

export const apiFactory = (baseURL: string) => ({
  getAll: () => apiClient.get(baseURL),
  getOne: (id: number) => apiClient.get(`${baseURL}/${id}`),
  create: (data: any) => apiClient.post(baseURL, data),
  update: (id: number, data: any) => apiClient.put(`${baseURL}/${id}`, data),
  delete: (id: number) => apiClient.delete(`${baseURL}/${id}`),
});