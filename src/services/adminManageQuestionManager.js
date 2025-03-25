import apiService from "./apiService";

const endpoint = "/api/admin/assigneduser";

export const getQuestionsManager = () => apiService.getAll(endpoint);
export const adminManageAssignedUserManager = (data) =>
  apiService.create(endpoint, data);
export const updateAssignedUserManager = (id, data) =>
  apiService.update(endpoint, id, data);
export const deleteAssignedUserManager = (id) =>
  apiService.delete(endpoint, id);
export const getAssignedUserManager = (id) => apiService.getById(endpoint, id);
