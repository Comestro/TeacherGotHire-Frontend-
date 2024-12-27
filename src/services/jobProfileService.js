import axios from 'axios';
import { getApiUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    //'Authorization': `Token ${localStorage.getItem('access_token')}`, // Use API key from config service
  },
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

export const fetchClassCategory = async()=>{
  try{
     const response = await apiClient.get('/api/admin/classcategory/');
     //console.log("getclass:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const fetchJobRole = async()=>{
  try{
     const response = await apiClient.get('/api/admin/role/');
    //console.log("getrole:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const fetchTeacherJobRole = async()=>{
  try{
     const response = await apiClient.get('/api/admin/teacherjobtype/');
     //console.log("getteacherrole:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const fetchSubject = async()=>{
  try{
     const response = await apiClient.get('/api/admin/subject/');
    // console.log("getsubject:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const fetchQualification = async()=>{
  try{
     const response = await apiClient.get('/api/admin/educationalQulification/');
     console.log("getsubject:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const updateEducationProfile = async({payload, id })=>{
     try{
        console.log("payload",payload,id)
        const response = await apiClient.put(`api/self/teacherqualification/${id}/`,payload);
        console.log("eduresponse",response);
        console.log("hello");
        return JSON.parse(JSON.stringify(response)); 
     }
        catch (err) {
            console.error(' error:', err.response?.data || err);
            throw err;
     }
}

export const addEducationProfile = async(expriencedata)=>{
  try{
    const response = await apiClient.post('api/self/teacherqualification/',expriencedata);
    console.log(response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchEducationProfile = async()=>{
  try{
     const response = await apiClient.get('/api/self/teacherqualification/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const deleteEducationProfile = async(expriencedata)=>{
  try{

     const response = await apiClient.delete(`api/self/teacherqualification/${expriencedata.id}/`,expriencedata.data);
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
export const updateSkillsProfile = async(skillsdata)=>{
  try{
    const response = await apiClient.post('api/self/teacherskill/',skillsdata);
    console.log(response.data);
    return JSON.parese(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchSkillsProfile = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherskill/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const updateExprienceProfile = async({payload, id })=>{
  try{
    console.log("exp",{payload, id })
    const response = await apiClient.put(`api/self/teacherexperience/${id}/`,payload);
    console.log("response",response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const addExprienceProfile = async(expriencedata)=>{
  try{
    const response = await apiClient.post('api/self/teacherexperience/',expriencedata);
    console.log(response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchExprienceProfile = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherexperience/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const deleteExprienceProfile = async(expriencedata)=>{
  try{
     const response = await apiClient.delete(`api/self/teacherexperience/${expriencedata.id}/`,expriencedata.data);
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}


export const updateTeacherPrefrence = async(prefrenceData)=>{
  try{
    const response = await apiClient.put('api/self/teacherpreference/',prefrenceData);
    // console.log("teacher refrence",response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchTeacherPrefrence = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherpreference/');
    //  console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const updateTeacherJobPrefrenceLocation = async(prefrenceData)=>{
  try{
    const response = await apiClient.post('api/self/teacherjobpreferencelocation/',prefrenceData);
    console.log("teacher location refrence",response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const editTeacherJobPrefrenceLocation = async(prefrenceData)=>{
  try{
    console.log("edir",prefrenceData.id)
    const response = await apiClient.put(`api/self/teacherjobpreferencelocation/${prefrenceData.id}/`,prefrenceData.editData);
    console.log("Edit teacher location refrence",response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}

export const deleteTeacherJobPrefrenceLocation = async(locationId)=>{
  try{
    const response = await apiClient.delete(`api/self/teacherjobpreferencelocation/${locationId.id}/`);
    console.log("teacher location refrence",response.data);
    return JSON.parse(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}

export const fetchTeacherJobPrefrenceLocation = async()=>{
  try{
     const response = await apiClient.get('api/self/teacherjobpreferencelocation/');
    console.log("get teacher location refrence:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
export default apiClient;