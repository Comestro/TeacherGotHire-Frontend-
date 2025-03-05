import { login as loginService } from "./authServices";
import { userLogout } from "../features/authSlice";

export const login = async ({ email, password, navigate, setError, setLoading }) => {
  setError("");
  setLoading(true);
 
  try {
    const userData = await loginService({ email, password }); // Call the service function to authenticate the user

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
  } catch (error) {
    if (error.status === 401) {
      setError("Invalid email or password. Please try again.");
    } else if (error.status === 400) {
      setError("Bad request. Please check your input.");
    } else if (error.status === 500) {
      setError("Server error. Please try again later.");
    } else {
      setError(error.message || "An unexpected error occurred.");
    }
  } finally {
    setLoading(false); // Set loading to false
  }
};

export const handleLogout = (dispatch, navigate) => {
  dispatch(userLogout())
    .unwrap()
    .then(() => {
      console.log("Logout successful!");
      navigate("/signin");
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
};