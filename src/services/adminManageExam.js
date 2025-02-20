// ...existing code...
import apiService from "./apiService";

const endpoint = "/api/admin/exam";

export const getExam = () => apiService.getAll(endpoint);
export const getExamById = (id) => apiService.getById(endpoint, id);
export const createExam = (data) => apiService.create(endpoint, data);
export const updateExam = (id, data) => apiService.update(endpoint, id, data);
export const deleteExam = (id) => apiService.delete(endpoint, id);
export const deleteAllExam = (examIds) => apiService.bulkDelete(endpoint, examIds);

// question related create, update and delete
export const getQuestions = () => apiService.getAll("/api/admin/question");
export const getQuestionById = (id) => apiService.getById("/api/admin/question", id);
export const createQuestion = (data) => apiService.create("/api/admin/question", data);
export const updateQuestion = (id, data) => apiService.update("/api/admin/question", id, data);
export const deleteQuestion = (id) => apiService.delete("/api/admin/question", id);


