import apiService from "./apiService";

const endpoint = "/api/admin/allTeacher";

export const getTeacher = () => apiService.getAll(endpoint);
export const getTeacherById = (id) => apiService.getById(endpoint, id);
export const createTeacher = (data) => apiService.create(endpoint, data);
export const updateTeacher = (id, data) => apiService.update(endpoint, id, data);
export const deleteTeacher = (id) => apiService.delete(endpoint, id);
export const deleteAllTeacher = () => apiService.deleteAll(endpoint);