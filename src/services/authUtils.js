import { login as loginService } from "./authServices";
import { userLogout } from "../features/authSlice";


export const login = async ({ email, password, navigate }) => {
  try {
    const userData = await loginService({ email, password });
    if (userData) {
      if (userData?.role === "recruiter") {
        navigate("/recruiter");
      } else if (userData?.role === "teacher") {
        navigate("/teacher");
      } else if (userData?.role === "centeruser") {
        navigate("/examcenter");
      } else if (userData?.role === "questionuser") {
        navigate("/subject-expert");
      } else {
        navigate("/admin/dashboard");
      }
    }
    return userData;
  } catch (error) {
    throw error;
  }
};

export const handleLogout = (dispatch, navigate) => {
  dispatch(userLogout())
    .unwrap()
    .then(() => {
      navigate("/signin", { state: { success: "Logged out successfully!" } });
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
};