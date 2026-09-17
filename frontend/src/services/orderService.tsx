import api from "./api";
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  Pembayaran,
  CreatePembayaranPayload,
  ApiResponse,
} from "../types";

export const getAllOrder = async (): Promise<ApiResponse<Order[]>> => {
  const response = await api.get<ApiResponse<Order[]>>("/order");
  return response.data;
};

export const getOrderById = async (id: number): Promise<ApiResponse<Order>> => {
  const response = await api.get<ApiResponse<Order>>(`/order/${id}`);
  return response.data;
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<ApiResponse<Order>> => {
  const response = await api.post<ApiResponse<Order>>("/order", payload);
  return response.data;
};

export const updateOrderStatus = async (
  id: number,
  payload: UpdateOrderStatusPayload,
): Promise<ApiResponse<Order>> => {
  const response = await api.patch<ApiResponse<Order>>(
    `/order/status/${id}`,
    payload,
  );
  return response.data;
};

export const createPembayaran = async (
  payload: CreatePembayaranPayload,
): Promise<ApiResponse<Pembayaran>> => {
  const response = await api.post<ApiResponse<Pembayaran>>(
    "/pembayaran",
    payload,
  );
  return response.data;
};
