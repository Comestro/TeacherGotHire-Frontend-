import apiService from "./apiService";

const endpoint = "/api/admin/allTeacher";

export const getTeacher = () => apiService.getAll(endpoint);
export const getTeacherById = (id) => apiService.getById(endpoint, id);
export const createTeacher = (data) => apiService.create(endpoint, data);
export const updateTeacher = (id, data) =>
  apiService.update(endpoint, id, data);
export const deleteTeacher = (id) => apiService.delete(endpoint, id);
export const deleteAllTeacher = () => apiService.deleteAll(endpoint);
export const getTeacherProfile = (id) =>
  apiService.getById("/api/all/teacher/basicProfile", id);
export const getTeacherSkills = (id) =>
  apiService.getAll(`/api/admin/teacherskill/?teacher_id=${id}`);
export const getTeacherQualification = (id) =>
  apiService.getAll(`/api/admin/teacherqualification/?teacher_id=${id}`);
export const getTeacherExperience = (id) =>
  apiService.getAll(`/api/admin/teacherexperience/?teacher_id=${id}`);
export const getTeacherScorecard = (id) =>
  apiService.getAll(`api/admin/teacherexamresult?teacher_id=${id}`);
