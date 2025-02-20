import apiService from "./apiService";

const endpoint = "/api/admin/skill";

export const getSkills = () => apiService.getAll(endpoint);
export const getSkillsById = (id) => apiService.getById(endpoint, id);
export const createSkill = (data) => apiService.create(endpoint, data);
export const updateSkill = (id, data) => apiService.update(endpoint, id, data);
export const deleteSkill = (id) => apiService.delete(endpoint, id);
export const deleteAllSkills = () => apiService.deleteAll(endpoint);