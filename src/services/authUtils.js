import { login as loginService } from "./authServices";
import { userLogout } from "../features/authSlice";
import { toast } from "react-toastify";

export const login = async ({ email, password, navigate }) => {
  try {
    const userData = await loginService({ email, password });
    if (userData) {
      toast.success("Login successful!");
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
    toast.error(error.message || "Login failed");
    throw error;
  }
};

export const handleLogout = (dispatch, navigate) => {
  dispatch(userLogout())
    .unwrap()
    .then(() => {
      toast.success("Logged out successfully!");
      navigate("/signin");
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    });
};