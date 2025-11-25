import apiService from "./apiService";

const endpoint = "/api/admin/interview";

export const getInterview = () => apiService.getAll(endpoint);
export const getInterviewById = (id) => apiService.getById(endpoint, id);
export const updateInterview = (id, data) => apiService.update(endpoint, id, data);
export const createInterview = (data) => apiService.create(endpoint, data);