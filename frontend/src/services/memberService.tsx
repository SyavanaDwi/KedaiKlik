import api from "./api";
import type {
  Member,
  CreateMemberPayload,
  UpdateMemberPayload,
  ApiResponse,
} from "../types";

export const getAllMember = async (): Promise<ApiResponse<Member[]>> => {
  const response = await api.get<ApiResponse<Member[]>>("/member");
  return response.data;
};

export const getMemberById = async (
  id: number,
): Promise<ApiResponse<Member>> => {
  const response = await api.get<ApiResponse<Member>>(`/member/${id}`);
  return response.data;
};

export const createMember = async (
  payload: CreateMemberPayload,
): Promise<ApiResponse<Member>> => {
  const response = await api.post<ApiResponse<Member>>("/member", payload);
  return response.data;
};

export const updateMember = async (
  id: number,
  payload: UpdateMemberPayload,
): Promise<ApiResponse<Member>> => {
  const response = await api.put<ApiResponse<Member>>(`/member/${id}`, payload);
  return response.data;
};
