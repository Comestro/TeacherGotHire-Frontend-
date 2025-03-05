import apiService from "./apiService";

const endpoint = "/api/admin/role";

export const getJobTypes = async () => apiService.getAll(endpoint);
export const createJobType = async (data) => apiService.create(endpoint, data);
export const updateJobType = async (id, data) => apiService.update(endpoint, id, data);
export const deleteJobType = async (id) => apiService.delete(endpoint, id);