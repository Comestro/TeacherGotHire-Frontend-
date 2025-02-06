import apiService from "./apiService";

const endpoint = "/api/admin/level";

export const getLevel = () => apiService.getAll(endpoint);
export const getLevelById = (id) => apiService.getById(endpoint, id);
export const createLevel = (data) => apiService.create(endpoint, data);
export const updateLevel = (id, data) => apiService.update(endpoint, id, data);
export const deleteLevel = (id) => apiService.delete(endpoint, id);
export const deleteAllLevel = () => apiService.deleteAll(endpoint);