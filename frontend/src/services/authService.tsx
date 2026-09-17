import api from "./api";
import type {
  loginPayload,
  ApiResponse,
  User,
  RegisterPayload,
} from "../types";

export const login = async (
  payload: loginPayload,
): Promise<ApiResponse<User>> => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const register = async (
  payload: RegisterPayload,
): Promise<ApiResponse<User>> => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};
