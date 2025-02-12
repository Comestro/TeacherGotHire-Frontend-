import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../store/configue";

const secureApiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});

// Add interceptor to attach the token to every request
secureApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const RoleBasedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    secureApiClient
      .get("/api/self/customuser/")
      .then((response) => {
        // assuming your API returns an object with a "role" property
        setUserRole(response.data.role);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setUserRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div>Loading...</div>;

  // If there's no token, redirect to the login page.
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If the user's role (from the backend) is not among allowedRoles, redirect to unauthorized page.
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  // Otherwise, render the protected element.
  return element;
};

export default RoleBasedRoute;
