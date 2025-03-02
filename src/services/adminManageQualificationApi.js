import apiService from "./apiService";

const endpoint = "/api/admin/educationalQulification";

export const getQualification = () => apiService.getAll(endpoint);
export const getQualificationById = (id) => apiService.getById(endpoint, id);
export const createQualification = (data) => apiService.create(endpoint, data);
export const updateQualification = (id, data) => apiService.update(endpoint, id, data);
export const deleteQualification = (id) => apiService.delete(endpoint, id);
    