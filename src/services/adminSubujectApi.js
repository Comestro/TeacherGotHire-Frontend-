import apiService from "./apiService";

const endpoint = "/api/admin/subject/";

export const getSubjects = () => apiService.getAll(endpoint);
export const getSubjectById = (id) => apiService.getById(endpoint, id);
export const createSubject = (data) => apiService.create(endpoint, data);
export const updateSubject = (id, data) => apiService.update(endpoint, id, data);
export const deleteSubject = (id) => apiService.delete(endpoint, id);
export const deleteAllSubject = () => apiService.deleteAll(endpoint);