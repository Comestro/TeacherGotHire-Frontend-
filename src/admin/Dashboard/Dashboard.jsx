import React, { useState } from "react";
import { FaChalkboardTeacher, FaUserTie, FaClipboardCheck, FaUserCheck, FaBriefcase, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Line, Pie } from "react-chartjs-2";
import Layout from "../Admin/Layout";

export default function AdminDashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // mera man hai push karne ka

  const stats = {
    teachers: 1250,
    skillTests: 850,
    organizations: 320,
    pendingApprovals: 45,
    openJobs: 180,
  };

  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Teacher Registrations",
        data: [65, 75, 85, 95, 115, 125],
        borderColor: "#4F46E5",
        tension: 0.4,
      },
      {
        label: "School Registrations",
        data: [30, 35, 40, 45, 50, 55],
        borderColor: "#10B981",
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: ["Successful Hires", "Pending Jobs", "Unmatched"],
    datasets: [
      {
        data: [300, 150, 100],
        backgroundColor: ["#4F46E5", "#F59E0B", "#EF4444"],
      },
    ],
  };

  const recentActivities = [
    {
      name: "Prince kumar",
      action: "Completed Skill Test",
      score: "95%",
      date: "2024-01-20",
    },
    { name: "Ashish Kumar", action: "New Registration", date: "2024-01-19" },
    {
      name: "Aparna Joshi",
      action: "Posted Job",
      role: "Math Teacher",
      date: "2024-01-18",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        {/* Admin Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Welcome, Admin!
          </h1>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <img
                src="https://media.istockphoto.com/id/1414951150/photo/portrait-of-a-young-confidence-man-looking-at-the-camera-in-a-studio.jpg?s=1024x1024&w=is&k=20&c=uvAkk4yEej9BJRNUjUd3GrCeQyul4iLTvMAMk3mavus="
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700">Admin</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  <FaCog className="mr-2" /> Settings
                </button>
                <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <FaChalkboardTeacher className="text-indigo-600 text-3xl" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Teachers</p>
                <p className="text-xl font-bold">{stats.teachers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <FaClipboardCheck className="text-green-600 text-3xl" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Skill Tests</p>
                <p className="text-xl font-bold">{stats.skillTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <FaUserTie className="text-blue-600 text-3xl" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Recruiters</p>
                <p className="text-xl font-bold">{stats.organizations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <FaUserCheck className="text-yellow-600 text-3xl" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <p className="text-xl font-bold">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <FaBriefcase className="text-purple-600 text-3xl" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Open Jobs</p>
                <p className="text-xl font-bold">{stats.openJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Registration Trends</h2>
            <Line data={lineChartData} options={{ responsive: true }} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Job Match Statistics</h2>
            <Pie data={pieChartData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Manage Teachers
          </button>
          <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Manage Recruiter
          </button>
          <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Job Requests
          </button>
          <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Reports & Analytics
          </button>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium text-gray-800">{activity.name}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                  {activity.score && (
                    <p className="text-sm text-green-600">
                      Score: {activity.score}
                    </p>
                  )}
                  {activity.role && (
                    <p className="text-sm text-blue-600">
                      Role: {activity.role}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
