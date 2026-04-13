import apiService from "./apiService";

const endpoint = "/api/admin/recruiterenquiryform/";

export const getRecruiterEnquiry =  () => apiService.getAll(endpoint);
export const updateRecruiterEnquiry = (id, data) => apiService.update(endpoint, id, data);
export const deleteRecruiterEnquiry = (id) => apiService.delete(endpoint, id);