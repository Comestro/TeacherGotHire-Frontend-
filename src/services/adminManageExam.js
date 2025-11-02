import apiService from "./apiService";

const endpoint = "api/examsetter";

export const getExam = () => apiService.getAll(endpoint);
export const getExamById = (id) => apiService.getById(endpoint, id);
export const createExam = (data) => apiService.create(endpoint, data);
export const updateExam = (id, data) => apiService.update(endpoint, id, data);
export const deleteExam = (id) => apiService.delete(endpoint, id);
export const deleteAllExam = (examIds) => apiService.bulkDelete(endpoint, examIds);

// question related create, update and delete
export const getQuestions = () => apiService.getAll("/api/examsetter/question");
export const getQuestionById = (id) => apiService.getById("/api/examsetter/question", id);
export const createQuestion = (data) => apiService.create("/api/examsetter/question", data);
export const updateQuestion = (id, data) => apiService.update("/api/examsetter/question", id, data);
export const deleteQuestion = (id) => apiService.delete("/api/new/examsetter/question", id);


export const createNewQuestion = (data) => apiService.create("/api/new/examsetter/question", data);
export const updateNewQuestion = (id, data) => apiService.update("/api/new/examsetter/question", id, data);

// Update reorderQuestions function to handle language-specific reordering
export const reorderQuestions = async (questionIds) => {
  try {
    // Format the payload as { "order": [id1, id2, id3, ...] }
    const payload = { 
      order: questionIds
    };
    
    
    
    const response = await axiosInstance.post(
      `/admin/teacher/api/questions/reorder/`,
      payload
    );
    
    
    return response.data;
  } catch (error) {
    
    throw error;
  }
};


