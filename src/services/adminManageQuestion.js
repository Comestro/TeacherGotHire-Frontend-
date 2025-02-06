import apiService from "./apiService";

const endpoint = "/api/admin/question";

export const getQuestions = () => apiService.getAll(endpoint);
export const getQuestionById = (id) => apiService.getById(endpoint, id);
export const createQuestion = (data) => apiService.create(endpoint, data);
export const updateQuestion = (id, data) => apiService.update(endpoint, id, data);
export const deleteQuestion = (id) => apiService.delete(endpoint, id);
export const deleteAllQuestion = () => apiService.deleteAll(endpoint);