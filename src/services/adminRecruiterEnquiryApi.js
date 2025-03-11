import apiService from "./apiService";

const endpoint = "/api/admin/recruiterenquiryform/";

export const getRecruiterEnquiry =  () => apiService.getAll(endpoint);