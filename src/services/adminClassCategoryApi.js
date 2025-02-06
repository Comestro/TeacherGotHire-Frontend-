import apiService from "./apiService";

const endpoint = "/api/admin/classcategory/";

export const getClassCategory = () => apiService.getAll(endpoint);
export const getClassCategoryById = (id) => apiService.getById(endpoint, id);
export const createClassCategory = (data) => apiService.create(endpoint, data);
export const updateClassCategory = (id, data) =>
  apiService.update(endpoint, id, data);
export const deleteClassCategory = (id) => apiService.delete(endpoint, id);
export const deleteAllClassCategory = () => apiService.deleteAll(endpoint);
