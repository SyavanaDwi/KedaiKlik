import api from "./api";
import type {
  Menu,
  CreateMenuPayload,
  UpdateMenuPayload,
  ApiResponse,
} from "../types";

export const getAllMenu = async (): Promise<ApiResponse<Menu[]>> => {
  const response = await api.get<ApiResponse<Menu[]>>("/menu");
  return response.data;
};

export const getMenuById = async (id: number): Promise<ApiResponse<Menu>> => {
  const response = await api.get<ApiResponse<Menu>>(`/menu/${id}`);
  return response.data;
};

export const createMenu = async (
  payload: CreateMenuPayload,
): Promise<ApiResponse<Menu>> => {
  const response = await api.post<ApiResponse<Menu>>("/menu", payload);
  return response.data;
};

export const updateMenu = async (
  id: number,
  payload: UpdateMenuPayload,
): Promise<ApiResponse<Menu>> => {
  const response = await api.put<ApiResponse<Menu>>(`/menu/${id}`, payload);
  return response.data;
};

export const deleteMenu = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/menu/${id}`);
  return response.data;
};
