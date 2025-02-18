// ...existing code...
import apiService from "./apiService";

const endpoint = "/api/admin/exam/";

export const getExam = () => apiService.getAll(endpoint);
export const getExamById = (id) => apiService.getById(endpoint, id);
export const createExam = (data) => apiService.create(endpoint, data);
export const updateExam = (id, data) => apiService.update(endpoint, id, data);
export const deleteExam = (id) => apiService.delete(endpoint, id);
export const deleteAllExam = (examIds) => apiService.bulkDelete(endpoint, examIds);


