import api from "./api";
import type {
  Pelanggan,
  CreatePelangganPayload,
  UpdatePelangganPayload,
  ApiResponse,
} from "../types";

export const getAllPelanggan = async (): Promise<ApiResponse<Pelanggan[]>> => {
  const response = await api.get<ApiResponse<Pelanggan[]>>("/pelanggan");
  return response.data;
};

export const getPelangganById = async (
  id: number,
): Promise<ApiResponse<Pelanggan>> => {
  const response = await api.get<ApiResponse<Pelanggan>>(`/pelanggan/${id}`);
  return response.data;
};

export const createPelanggan = async (
  payload: CreatePelangganPayload,
): Promise<ApiResponse<Pelanggan>> => {
  const response = await api.post<ApiResponse<Pelanggan>>(
    "/pelanggan",
    payload,
  );
  return response.data;
};

export const updatePelanggan = async (
  id: number,
  payload: UpdatePelangganPayload,
): Promise<ApiResponse<Pelanggan>> => {
  const response = await api.put<ApiResponse<Pelanggan>>(
    `/pelanggan/${id}`,
    payload,
  );
  return response.data;
};
