import apiService from "./apiService";

const endpoint = "/api/admin/apply";

export const getJobApplied = () => apiService.getAll(endpoint);