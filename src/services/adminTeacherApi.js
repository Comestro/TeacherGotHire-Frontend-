import apiService from "./apiService";

const endpoint = "/api/admin/allTeacher";

export const getTeacher = () => apiService.getAll(endpoint);
export const getTeacherById = (id) => apiService.getById(endpoint, id);
export const createTeacher = (data) => apiService.create(endpoint, data);
export const updateTeacher = (id, data) =>
  apiService.update(endpoint, id, data);
export const deleteTeacher = (id) => apiService.delete(endpoint, id);
export const deleteAllTeacher = () => apiService.deleteAll(endpoint);

// basic profile call for teacher by id
export const getTeacherProfile = (id) =>
  apiService.getById("/api/all/teacher/basicProfile", id);
// get skills of teacher by id
export const getTeacherSkills = (id) =>
  apiService.getAll(`/api/self/teacherskill/?teacher_id=${id}`);
// get qualification of teacher by id
export const getTeacherQualification = (id) =>
  apiService.getById("/api/admin/teacherqualification", id);
// get experience of teacher by id
export const getTeacherExperience = (id) =>
  apiService.getById("/api/admin/teacherexperience", id);

// get scorecard of teacher by id
export const getTeacherScorecard = (id) =>
  apiService.getAll(`api/admin/teacherexamresult?teacher_id=${id}`);
