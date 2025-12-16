import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiTarget,
  FiFileText,
  FiGrid,
  FiKey,
  FiActivity,
  FiStar,
  FiAward,
  FiBell,
  FiMessageSquare,
  FiMapPin,
  FiBook,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import Layout from "../Admin/Layout";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../../services/adminDashboardApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [chartTab, setChartTab] = useState(0);
  const [showAllActions, setShowAllActions] = useState(false);
  const [mockData, setMockData] = useState({
    teachers: { total: 0, pending: 0, thisMonth: 0 },
    recruiters: { total: 0, pending: 0, thisMonth: 0 },
    interviews: { upcoming: 0, completed: 0 },
    passkeys: { total: 0, pending: 0, approved: 0 },
    examcenters: { total_examcenter: 0 },
    QuestioReports: { total: 0 },
    HireRequests: { total: 0, requested: 0, approved: 0, rejected: 0 },
    TeacherApply: { total: 0, pending: 0, approved: 0 },
    RecruiterEnquiryForm: { total: 0 },
    subjects: { total: 0 },
    class_categories: { total: 0 },
    assignedquestionusers: { total: 0 },
    skills: { total: 0 },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        setMockData(response);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#64748B",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "#E2E8F0",
          borderDash: [5, 5],
          drawBorder: false,
        },
        ticks: {
          color: "#64748B",
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
    },
  };

  const statsSummary = [
    {
      label: "Teachers",
      value: mockData.teachers?.total,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-100",
      icon: <FiUsers size={24} />,
    },
    {
      label: "Recruiters",
      value: mockData.recruiters?.total,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      icon: <FiBriefcase size={24} />,
    },
    {
      label: "Interviews",
      value: mockData.interviews?.completed,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      icon: <FiCalendar size={24} />,
    },
    {
      label: "Hiring",
      value: mockData.HireRequests?.total,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      icon: <FiCheckSquare size={24} />,
    },
    {
      label: "Center",
      value: mockData.examcenters?.total_examcenter,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-100",
      icon: <FiTarget size={24} />,
    },
    {
      label: "Applications",
      value: mockData.TeacherApply?.total,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      icon: <FiClipboard size={24} />,
    },
  ];

  const quickActions = [
    {
      icon: <FiUsers />,
      text: "Teachers",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      link: "/admin/manage/teacher",
    },
    {
      icon: <FiBriefcase />,
      text: "Recruiters",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      link: "/admin/manage/recruiter",
    },
    {
      icon: <FiCheckSquare />,
      text: "Hiring",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/admin/manage/hiring",
    },
    {
      icon: <FiCalendar />,
      text: "Interviews",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/manage/interview",
    },
    {
      icon: <FiTarget />,
      text: "Exams",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      link: "/admin/manage/exam",
    },
    {
      icon: <FiBook />,
      text: "Subjects",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/admin/manage/subject",
    },
    {
      icon: <FiGrid />,
      text: "Categories",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      link: "/admin/manage/class/category",
    },
    {
      icon: <FiKey />,
      text: "Passkeys",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/manage/passkey",
    },
    {
      icon: <FiActivity />,
      text: "Skills",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      link: "/admin/manage/skills",
    },
    {
      icon: <FiStar />,
      text: "Levels",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/admin/manage/level",
    },
    {
      icon: <FiAward />,
      text: "Qualifications",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/manage/qualification",
    },
    {
      icon: <FiFileText />,
      text: "Job Applications",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      link: "/admin/manage/teacher/applied/job",
    },
    {
      icon: <FiBell />,
      text: "Enquiries",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      link: "/admin/manage/recruiter/enquiry",
    },
    {
      icon: <FiMessageSquare />,
      text: "Question manager",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/admin/manage/question/manager",
    },
    {
      icon: <FiMapPin />,
      text: "Exam Centers",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      link: "/admin/manage/exam/center",
    },
    {
      icon: <FiBriefcase />,
      text: "Job Types",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/manage/teacher/jobtype",
    },
  ];

  const displayedQuickActions = showAllActions
    ? quickActions
    : quickActions.slice(0, 12);

  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-teal-700 mb-1">
              Teacher Assessment & Hiring Portal
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FiActivity className="text-teal-500" />
              Dashboard Overview •{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statsSummary.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center transition-colors group-hover:scale-110 duration-300`}
                >
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">
                    {stat.value || 0}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Analytics</h2>
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setChartTab(0)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      chartTab === 0
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <FiTrendingUp /> Trends
                    </div>
                  </button>
                  <button
                    onClick={() => setChartTab(1)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      chartTab === 1
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <FiBarChart2 /> Compare
                    </div>
                  </button>
                  <button
                    onClick={() => setChartTab(2)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      chartTab === 2
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <FiPieChart /> Distribution
                    </div>
                  </button>
                </div>
              </div>

              <div className="h-64 md:h-80">
                {chartTab === 0 && (
                  <Line
                    options={chartOptions}
                    data={{
                      labels: [
                        "Teachers",
                        "Recruiters",
                        "Interviews",
                        "Hiring",
                        "Applications",
                      ],
                      datasets: [
                        {
                          label: "Total Count",
                          data: [
                            mockData.teachers?.total || 0,
                            mockData.recruiters?.total || 0,
                            (mockData.interviews?.upcoming || 0) +
                              (mockData.interviews?.completed || 0),
                            mockData.HireRequests?.total || 0,
                            mockData.TeacherApply?.total || 0,
                          ],
                          borderColor: "#0d9488",
                          backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(
                              0,
                              0,
                              0,
                              300
                            );
                            gradient.addColorStop(0, "rgba(13, 148, 136, 0.2)");
                            gradient.addColorStop(1, "rgba(13, 148, 136, 0)");
                            return gradient;
                          },
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: "#fff",
                          pointBorderColor: "#0d9488",
                          pointBorderWidth: 2,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                  />
                )}
                {chartTab === 1 && (
                  <Bar
                    options={chartOptions}
                    data={{
                      labels: [
                        "Teachers",
                        "Recruiters",
                        "Interviews",
                        "Hiring",
                      ],
                      datasets: [
                        {
                          label: "Active",
                          data: [
                            mockData.teachers?.total || 0,
                            mockData.recruiters?.total || 0,
                            mockData.interviews?.upcoming || 0,
                            mockData.HireRequests?.approved || 0,
                          ],
                          backgroundColor: "#0d9488",
                          borderRadius: 4,
                        },
                        {
                          label: "Pending/Completed",
                          data: [
                            mockData.teachers?.pending || 0,
                            mockData.recruiters?.pending || 0,
                            mockData.interviews?.completed || 0,
                            mockData.HireRequests?.requested || 0,
                          ],
                          backgroundColor: "#99f6e4",
                          borderRadius: 4,
                        },
                      ],
                    }}
                  />
                )}
                {chartTab === 2 && (
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="w-64 h-64">
                      <Doughnut
                        options={{
                          ...chartOptions,
                          cutout: "70%",
                          plugins: {
                            legend: {
                              position: "right",
                            },
                          },
                        }}
                        data={{
                          labels: [
                            "Teachers",
                            "Recruiters",
                            "Hiring Requests",
                            "Applications",
                          ],
                          datasets: [
                            {
                              data: [
                                mockData.teachers?.total || 0,
                                mockData.recruiters?.total || 0,
                                mockData.HireRequests?.total || 0,
                                mockData.TeacherApply?.total || 0,
                              ],
                              backgroundColor: [
                                "#0d9488",
                                "#06b6d4",
                                "#3b82f6",
                                "#10b981",
                              ],
                              borderWidth: 0,
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity (Right Column) */}
          <div className="space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Quick Actions
                </h2>
                <button
                  onClick={() => setShowAllActions(!showAllActions)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline transition-all"
                >
                  {showAllActions ? "Show Less" : "View All"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                {displayedQuickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.link)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-24"
                  >
                    <div
                      className={`text-2xl mb-2 ${action.color} group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-teal-700 text-center leading-tight">
                      {action.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Application Stages Preview */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-teal-400 opacity-20 rounded-full blur-xl"></div>

              <h3 className="text-lg font-bold mb-1 relative z-10">
                Application Status
              </h3>
              <p className="text-teal-100 text-xs mb-4 relative z-10">
                Overview of recent activity
              </p>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-300"></span>{" "}
                    Pending
                  </span>
                  <span className="font-bold">
                    {mockData.TeacherApply?.pending || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>{" "}
                    Approved
                  </span>
                  <span className="font-bold">
                    {mockData.TeacherApply?.approved || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-300"></span>{" "}
                    Requests
                  </span>
                  <span className="font-bold">
                    {mockData.HireRequests?.requested || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
