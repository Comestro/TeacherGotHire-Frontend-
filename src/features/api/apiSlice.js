import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from "../../store/configue";

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
     baseUrl: getApiUrl(), // Add this lin
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    // Define the centers endpoint
    getCenters: builder.query({
      query: () => '/api/admin/examcenter/',
      transformResponse: (response) => {
        console.log('Centers response from RTK Query:', response);
        return response;
      },
      // Add error handling
      transformErrorResponse: (response) => {
        console.error('Error fetching centers:', response);
        return response;
      },
    }),
    getJobsApplyDetails: builder.query({
      query:()=>'/api/self/apply/',
      transformResponse: (response) => {
        console.log('Centers response from RTK Query:', response);
        return response;
      },
    }),
    getApplyEligibility: builder.query({
      query: () => '/api/self/apply-eligibility/',
      transformResponse: (response) => {
        console.log('Apply eligibility response from RTK Query:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Error fetching apply eligibility:', response);
        return response;
      },
    })
  }),
  

  
});


// Export the auto-generated hook
export const { useGetCentersQuery, useGetJobsApplyDetailsQuery, useGetApplyEligibilityQuery } = apiSlice;
