import apiService from "./apiService";

const endpoint = "/api/admin/assigneduser";

export const getQuestionsManager = () => apiService.getAll(endpoint);
export const adminManageAssignedUserManager = (data) =>
  apiService.create(endpoint, data);
