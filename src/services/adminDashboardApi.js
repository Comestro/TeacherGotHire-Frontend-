import apiService from "./apiService";

const endpoint =
  "/api/admin/count?teachers=true&recruiters=true&interviews=true&passkeys=true&examcenters=true&questioReports=true&hireRequests=true&teacherApply=true&recruiterEnquiry=true&subjects=true&class_categories=true&assignedquestionusers=true&skills=true";

export const getDashboardData = () => apiService.getAll(endpoint);
