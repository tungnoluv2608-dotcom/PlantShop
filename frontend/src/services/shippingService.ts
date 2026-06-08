import { api } from "./apiService";

export type ShippingMethod = "standard" | "express" | "sameday";

export interface ShippingQuoteMethod {
  method: ShippingMethod;
  fee: number;
  available: boolean;
  reason: string | null;
}

export interface ShippingQuoteResponse {
  subtotal: number;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  total: number;
  zone: {
    id: number | null;
    name: string;
    allowsSameday: boolean;
    freeShippingThreshold: number;
  };
  methods: ShippingQuoteMethod[];
  allowsSameday: boolean;
}

export interface ShippingQuoteRequest {
  items: Array<{ id: string; quantity: number }>;
  shippingMethod: ShippingMethod;
  province: string;
  district?: string | null;
}

export async function fetchShippingQuote(
  payload: ShippingQuoteRequest,
): Promise<ShippingQuoteResponse> {
  const { data } = await api.post<ShippingQuoteResponse>("/shipping/quote", payload);
  return data;
}