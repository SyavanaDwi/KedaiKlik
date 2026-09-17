import api from "./api";

export const getUserById = async (id: number) => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const updateUser = async (id: number, payload: any) => {
  const response = await api.put(`/user/${id}`, payload);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/user");
  return response.data;
};
