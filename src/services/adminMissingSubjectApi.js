import apiService from "./apiService";

const endpoint = "api/missing-subject";

export const getMissingSubjects = () => apiService.getAll(endpoint);
export const deleteMissingSubject = (id) => apiService.delete(endpoint, id);
export const bulkDeleteMissingSubjects = (ids) => apiService.bulkDelete(endpoint, ids);
