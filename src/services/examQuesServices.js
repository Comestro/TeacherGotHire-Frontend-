import axios from "axios";
import { getApiUrl } from "../store/configue";

const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Fetch the token from localStorage
    if (token) {
      config.headers["Authorization"] = `Token ${token}`; // Add the token to the header
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
      console.error("Unauthorized: Logging out the user");
      localStorage.removeItem("access_token"); // Clear the token
      window.location.href = "/signin"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export const fetchLevel = async () => {
  try {
    const response = await apiClient.get(`/api/admin/level/`);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const fetchExam = async ({
  level_id,
  subject_id,
  type,
  class_category_id
}) => {
  try {
    const response = await apiClient.get(`/api/self/exam/exams/`, {
      params: {
        level_id,
        subject_id,
        type,
        class_category_id,
      },
    });
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const fetchQuestion = async ({ exam_id, language }) => {
  try {
    
    const response = await apiClient.get(`/api/self/exam/${exam_id}/`, {
      params: {
        language,
      },
    });
    
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const Attempts = async (params= {}) => {
  try {
    const response = await apiClient.get(`/api/self/teacherexamresult/`,{
      params: {  // axios will properly encode these
        isqualified: params.isqualified,
        level_code: params.level_code
      }
    });
    
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};


export const addResult = async({
  exam,
  correct_answer,
  incorrect_answer,
  is_unanswered,
  language,
})=>{
  try{
    console.log("result",{
      correct_answer,
      incorrect_answer,
      is_unanswered,
      language
    })
     const response = await apiClient.post(`/api/self/teacherexamresult/`,{
      exam,
      correct_answer,
      incorrect_answer,
      is_unanswered,
      language
    })
          
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
};

export const GeneratePasskey = async ({user_id,exam_id,center_id}) => {
  try {
    const response = await apiClient.post(`/api/generate-passkey/`,{user_id,exam_id,center_id});
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};
export const getGeneratedPasskey = async () => {
  try {
    const response = await apiClient.get(`/api/generate-passkey/`);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};



export const VerifyPasscode = async ({exam_id,entered_passcode}) => {
  try {
    const response = await apiClient.post(`/api/verify-passcode/`,{exam_id,entered_passcode});
    
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data?.error || err);
    throw err;
  }
};


export const AddInterview = async ({subject,time,class_category,level}) => {
  try {
    const response = await apiClient.post(`/api/self/interview/`,{subject,time,class_category,level});
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const Interview = async () => {
  try {
    const response = await apiClient.get(`/api/self/interview/`);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const ReportReason = async () => {
  try {
    const response = await apiClient.get(`/api/admin/reason/`);
    console.log("reason",response)
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const AddReport = async ({question,issue_type}) => {
  try {
    const response = await apiClient.post(`/api/self/report/`,{question,issue_type});
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const AllCenter = async () => {
  try {
    const response = await apiClient.get(`/api/admin/examcenter/`);
    console.log("allcenter",response)
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};
export const Approved = async ({user_id,exam_id}) => {
  try {
    const response = await apiClient.post(`/api/approve-passkey/`,{user_id,exam_id});
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const fetchCenterUser= async () => {
  try {
    const response = await apiClient.get(`/api/examcenter/teachers/`);
    console.log("centerUser",response.data)
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const createExamSet= async (payload) => {
  try {
    const response = await apiClient.post(`/api/examsetter/`,payload);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};
export const editExamSet= async ({ payload, id }) => {
  try {
    const response = await apiClient.put(`/api/examsetter/${id}/`,payload);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const setterExamSet= async () => {
  try {
    const response = await apiClient.get(`/api/examsetter/`);
    console.log("ExamSetter",response)
    return response.data;
    
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const delExamSet= async (id) => {
  try {
    const response = await apiClient.delete(`/api/examsetter/${id}/`);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};
export const addQuestionToExamSet= async (payload) => {
  try {
    const response = await apiClient.post(`/api/examsetter/question/`,payload);
    console.log("ExamSetter",response)
    return response.data;
    
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const editQuestionToExamSet= async ( questionId, payload) => {
  console.log("payload in service for update question", payload)
  try {
    const response = await apiClient.put(`/api/examsetter/question/${questionId}/`, payload);
    console.log("ExamSetter",response)
    return response.data;
    
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const getQuestionForExamSet= async ( questionId) => {
  console.log("payload in service for update question", payload)
  try {
    const response = await apiClient.get(`/api/examsetter/question/${questionId}/`);
    console.log("ExamSetter",response)
    return response.data;
    
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const getAssignUserSubject= async () => {
  try {
    const response = await apiClient.get(`/api/self/assigneduser/`);
    console.log("Assignuser",response)
    return response.data;
    
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const jobApply= async ({subject, class_category}) => {
  try {
    const response = await apiClient.post(`/api/self/apply/
      `,{subject, class_category});
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const fetchQuestionsByExamSet = async (examSetId) => {
  try {
    const response = await axios.get(`${API_URL}/exam/questions/${examSetId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions by exam set:", error);
    throw error;
  }
};