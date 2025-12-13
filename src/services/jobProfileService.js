import axios from 'axios';
import { getApiUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    
  },
  withCredentials: true, 
}); 



apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Fetch the token from localStorage
    if (token) {
      config.headers['Authorization'] = `Token ${token}`; // Add the token to the header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token'); // Clear the token
    }
    return Promise.reject(error);
  }
);

export const fetchClassCategory = async()=>{
  try{
     const response = await apiClient.get('/api/public/classcategory/');
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const fetchJobRole = async()=>{
  try{
     const response = await apiClient.get('/api/admin/role/');
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const fetchTeacherJobRole = async()=>{
  try{
     const response = await apiClient.get('/api/admin/teacherjobtype/');
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const fetchSubject = async()=>{
  try{
     const response = await apiClient.get('/api/admin/subject/');
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const fetchQualification = async()=>{
  try{
     const response = await apiClient.get('/api/admin/educationalQulification/');
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const fetchAllSkills = async()=>{
  try{
     const response = await apiClient.get('/api/admin/skill/');
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const updateEducationProfile = async({payload, id })=>{
     try{
        const response = await apiClient.put(`api/self/teacherqualification/${id}/`,payload);
        
        return JSON.parse(JSON.stringify(response)); 
     }
        catch (err) {
            const errorMessage = err.response?.data && typeof err.response.data === "object"
                ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
                : err.message || "Failed to update education profile";
        
            throw new Error(errorMessage);
          }
     }


export const addEducationProfile = async(expriencedata)=>{
  try{
    const response = await apiClient.post('api/self/teacherqualification/',expriencedata);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch (err) {
    const errorMessage = err.response?.data && typeof err.response.data === "object"
        ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
        : err.message || "Failed to update education profile";

    throw new Error(errorMessage);
  }
}
export const fetchEducationProfile = async()=>{
  try{
     const response = await apiClient.get('/api/self/teacherqualification/');
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const deleteEducationProfile = async(expriencedata)=>{
  try{

     const response = await apiClient.delete(`api/self/teacherqualification/${expriencedata.id}/`,expriencedata.data);
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}
export const updateSkillsProfile = async(skillsdata)=>{
  try{
    const response = await apiClient.post('api/self/teacherskill/',skillsdata);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            
            throw err;
  }
}
export const fetchSkillsProfile = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherskill/');
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}
export const deleteSkillProfile = async(skillToRemove)=>{
  try{
     const response = await apiClient.delete(`api/self/teacherskill/${skillToRemove.id}/`,skillToRemove.name);
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const updateExprienceProfile = async({payload, id})=>{
  try{
    const response = await apiClient.put(`api/self/teacherexperience/${id}/`,payload);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            
            throw err;
  }
}
export const addExprienceProfile = async(expriencedata)=>{
  try{
    const response = await apiClient.post('api/self/teacherexperience/',expriencedata);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            throw err.response.data;
  }
}
export const fetchExprienceProfile = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherexperience/');
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const deleteExprienceProfile = async(expriencedata)=>{
  try{
     const response = await apiClient.delete(`api/self/teacherexperience/${expriencedata.id}/`,expriencedata.data);
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}


export const updateTeacherPrefrence = async(prefrenceData)=>{
  try{
    const response = await apiClient.put('api/self/teacherpreference/',prefrenceData);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            
            throw err;
  }
}
export const fetchTeacherPrefrence = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherpreference/');
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}

export const updateTeacherJobPrefrenceLocation = async(prefrenceData)=>{
  try{
    const response = await apiClient.post('api/self/teacherjobpreferencelocation/',prefrenceData);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            
            throw err;
  }
}
export const editTeacherJobPrefrenceLocation = async(prefrenceData)=>{
  try{
    const response = await apiClient.put(`api/self/teacherjobpreferencelocation/${prefrenceData.id}/`,prefrenceData.editData);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            
            throw err;
  }
}

export const deleteTeacherJobPrefrenceLocation = async(locationId)=>{
  try{
    const response = await apiClient.delete(`api/self/teacherjobpreferencelocation/${locationId.id}/`);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            
            throw err;
  }
}

export const fetchTeacherJobPrefrenceLocation = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherjobpreferencelocation/');
    
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}
export default apiClient;