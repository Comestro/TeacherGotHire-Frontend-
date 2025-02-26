import apiService from "./apiService";

const endpoint = "/api/admin/hirerequest";

export const getHireRequest = () => apiService.getAll(endpoint);
export const updateHireRequest = (id, data) => apiService.update(endpoint, id, data);