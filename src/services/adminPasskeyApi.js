import apiService from "./apiService";

const endpoint = "/api/admin/passkey"

export const getPasskey = () => apiService.getAll(endpoint);
export const updatePasskey = (id, data) => apiService.update(endpoint, id, data);