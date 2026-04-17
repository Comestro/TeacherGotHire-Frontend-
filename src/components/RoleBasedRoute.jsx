import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchUserData } from "../services/authServices";

const RoleBasedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  const storedRole = localStorage.getItem("role"); // Quick check
  const [userRole, setUserRole] = useState(storedRole); 
  const [loading, setLoading] = useState(!storedRole); // Skip loading if we have a stored role

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Always background-verify even if we have a stored role
    fetchUserData()
      .then((data) => {
        setUserRole(data.role);
        // Sync storage if it changed
        if (data.role !== storedRole) {
          localStorage.setItem("role", data.role);
        }
      })
      .catch((error) => {
        // If it was a 401, the interceptor in authServices will have cleared the token.
         setUserRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, storedRole]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Main Content Skeleton */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          

          {/* Main Content Area Skeleton */}
          <div className="lg:w-3/4">
            {/* Page Title Skeleton */}
            <div className="mb-6">
              <div className="w-64 h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Status Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Content Blocks Skeleton */}
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="w-48 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table/List Skeleton */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b">
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div>
                        <div className="w-32 h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-full h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className={`h-10 bg-gray-200 rounded animate-pulse w-full`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (!token) {
    return <Navigate to="/signin" />;
  }
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }
  return element;
};

export default RoleBasedRoute;
