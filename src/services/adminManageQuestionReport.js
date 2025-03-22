import apiService from "./apiService";

const endpoint = "/api/admin/report";

// Changed method names to match those available in apiService
export const getQuestionReport = async () => apiService.getAll(endpoint);
export const getSingleQuestionReport = async (id) =>
  apiService.getById(endpoint, id);
export const createQuestionReport = async (data) =>
  apiService.create(endpoint, data);
export const updateQuestionReport = async (id, data) =>
  apiService.update(endpoint, id, data);
export const patchQuestionReport = async (id, data) =>
  apiService.patch(endpoint, id, data);
export const deleteQuestionReport = async (id) =>
  apiService.delete(endpoint, id);
