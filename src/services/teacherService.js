import apiService from "./apiService";

const endpoint = "api/admin/teacher/";

export const getTeachers = async () => {
  return await apiService.get(endpoint);
};

export const getTeacher = async (id) => {
  return await apiService.get(`${endpoint}${id}`);
};
