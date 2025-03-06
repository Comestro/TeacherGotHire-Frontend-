import apiService from "./apiService";

const endpoint = "/api/admin/examcenter";

export const getManageCenter = () => apiService.getAll(endpoint);
export const createCenterManager = (data) => apiService.create(endpoint, data);
export const updateCenterManager = (id, data) =>
  apiService.update(endpoint, id, data);
export const deleteCenterManager = (id) => apiService.delete(endpoint, id);
export const getCenterManager = (id) => apiService.getById(endpoint, id);