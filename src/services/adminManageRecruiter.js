import apiService from "./apiService";

const endpoint = "/api/all/recruiter/basicProfile";

export const getRecruiter = () => apiService.getAll(endpoint);
export const getRecruiterById = (id) => apiService.getById(endpoint, id);
export const createRecruiter = (data) => apiService.create(endpoint, data);
export const updateRecruiter = (id, data) =>
  apiService.update(endpoint, id, data);
export const deleteRecruiter = (id) => apiService.delete(endpoint, id);