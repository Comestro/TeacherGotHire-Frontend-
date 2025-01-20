import React, { useState, useEffect } from "react";
import { FaBriefcase, FaUsers, FaCalendarAlt, FaCheckCircle, FaBell, FaChartBar, FaUserPlus } from "react-icons/fa";
import { format } from "date-fns";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const RecruiterDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics, setMetrics] = useState({
    activeJobs: 12,
    applications: 145,
    interviews: 28,
    hires: 8
  });

  const [jobs] = useState([
    { id: 1, title: "Mathematics Teacher", applications: 45, status: "Open" },
    { id: 2, title: "Science Teacher", applications: 32, status: "In-Progress" },
    { id: 3, title: "English Teacher", applications: 28, status: "Closed" },
  ]);

  const [applications] = useState([
    { id: 1, name: "John Smith", position: "Mathematics Teacher", date: "2024-01-15" },
    { id: 2, name: "Sarah Johnson", position: "Science Teacher", date: "2024-01-14" },
    { id: 3, name: "Michael Brown", position: "English Teacher", date: "2024-01-13" },
  ]);

  const [notifications] = useState([
    { id: 1, message: "New application received for Mathematics Teacher" },
    { id: 2, message: "Interview scheduled with Sarah Johnson" },
    { id: 3, message: "Michael Brown accepted interview invite" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const barData = {
    labels: ["Applications", "Shortlisted", "Interviewed", "Hired"],
    datasets: [
      {
        label: "Recruitment Pipeline",
        data: [145, 50, 28, 8],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const pieData = {
    labels: ["Pending", "Shortlisted", "Rejected"],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(34, 197, 94, 0.5)",
          "rgba(239, 68, 68, 0.5)",
        ],
      },
    ],
  };

  return (
    <><div className="w-auto">
      <div className="px-14 py-3 min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Recruiter Dashboard</h1>
              <p className="text-gray-600 mt-2">Overview of your posted jobs, applications, and recruitment progress.</p>
              <p className="text-gray-700 mt-2">Welcome back, John Doe!</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">{format(currentTime, "MMMM d, yyyy")}</p>
              <p className="text-gray-600">{format(currentTime, "h:mm:ss a")}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center">
              <FaBriefcase className="text-blue-500 text-2xl mr-4" />
              <div>
                <p className="text-gray-600">Active Jobs</p>
                <h3 className="text-2xl font-bold">{metrics.activeJobs}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center">
              <FaUsers className="text-green-500 text-2xl mr-4" />
              <div>
                <p className="text-gray-600">Applications</p>
                <h3 className="text-2xl font-bold">{metrics.applications}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center">
              <FaCalendarAlt className="text-yellow-500 text-2xl mr-4" />
              <div>
                <p className="text-gray-600">Interviews</p>
                <h3 className="text-2xl font-bold">{metrics.interviews}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center">
              <FaCheckCircle className="text-purple-500 text-2xl mr-4" />
              <div>
                <p className="text-gray-600">Hires</p>
                <h3 className="text-2xl font-bold">{metrics.hires}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Postings Section */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Active Job Postings</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Job Title</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Applications</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{job.title}</td>
                      <td className="py-3 px-4">{job.applications}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${job.status === "Open"
                              ? "bg-green-100 text-green-800"
                              : job.status === "In-Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                        <button className="text-green-500 hover:text-green-700 mr-2">Edit</button>
                        <button className="text-red-500 hover:text-red-700">Close</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaBell className="mr-2" /> Notifications
            </h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-gray-700">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
    {/* </div><div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Recruitment Pipeline</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Application Status</h2>
          <Pie data={pieData} />
        </div>
      </div><div className="mt-8 bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <FaUserPlus className="mr-2" /> Post New Job
          </button>
          <button className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <FaUsers className="mr-2" /> View Shortlisted
          </button>
          <button className="flex items-center justify-center p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
            <FaCalendarAlt className="mr-2" /> Schedule Interviews
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            <FaChartBar className="mr-2" /> View Reports
          </button>
        </div>
      </div><footer className="mt-8 text-center text-gray-600">
        <div className="flex justify-center space-x-4">
          <button className="hover:text-blue-500">Manage Teachers</button>
          <button className="hover:text-blue-500">Reports</button>
          <button className="hover:text-blue-500">Settings</button>
        </div>
        <p className="mt-4">Need help? Contact support@recruitment.com</p>
      </footer> */}
      </div >
    </div >
    </>
  );
};

export default RecruiterDashboard;