import { api } from "./apiService";
import type { ShippingAddress } from "../types";

export const addressService = {
  list: () => api.get<ShippingAddress[]>("/addresses").then((r) => r.data),

  create: (address: Omit<ShippingAddress, "id">) =>
    api.post<ShippingAddress>("/addresses", address).then((r) => r.data),

  update: (id: string, address: Omit<ShippingAddress, "id">) =>
    api.put<ShippingAddress>(`/addresses/${id}`, address).then((r) => r.data),

  remove: (id: string) => api.delete(`/addresses/${id}`).then((r) => r.data),

  setDefault: (id: string) => api.patch(`/addresses/${id}/default`).then((r) => r.data),
};
