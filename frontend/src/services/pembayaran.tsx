import api from "./api";
import type {
  Pembayaran,
  CreatePembayaranPayload,
  ApiResponse,
} from "../types";

export const createPembayaran = async (
  payload: CreatePembayaranPayload,
): Promise<ApiResponse<Pembayaran>> => {
  const response = await api.post<ApiResponse<Pembayaran>>(
    "/pembayaran",
    payload,
  );
  return response.data;
};

export const getPembayaranByOrderId = async (
  orderId: number,
): Promise<ApiResponse<Pembayaran>> => {
  const response = await api.get<ApiResponse<Pembayaran>>(
    `/pembayaran/${orderId}`,
  );
  return response.data;
};
