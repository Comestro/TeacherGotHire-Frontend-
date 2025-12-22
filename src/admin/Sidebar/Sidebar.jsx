import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLogout } from "../../services/authUtils";
import {
  FiGrid,
  FiBox,
  FiBook,
  FiAward,
  FiTrendingUp,
  FiBriefcase,
  FiFileText,
  FiGlobe,
  FiKey,
  FiVideo,
  FiUserCheck,
  FiMessageSquare,
  FiFlag,
  FiUsers,
  FiUser,
  FiHelpCircle,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [collapseOpen, setCollapseOpen] = useState(false);

  const handleCollapseToggle = () => {
    setCollapseOpen((prev) => !prev);
  };

  const isActive = (path) => location.pathname === path;

  // Menu Items Config
  // Converted Icons to React Icons (Feather) for consistency
  const menuItems = [
    {
      text: "Dashboard",
      icon: <FiGrid />,
      link: "/admin/dashboard",
      section: "main",
    },

    // Data Management
    {
      text: "Class category",
      icon: <FiBox />,
      link: "/admin/manage/class/category",
      section: "data",
    },
    {
      text: "Subjects",
      icon: <FiBook />,
      link: "/admin/manage/subject",
      section: "data",
    },
    {
      text: "Skills",
      icon: <FiTrendingUp />,
      link: "/admin/manage/skills",
      section: "data",
    },
    {
      text: "Level",
      icon: <FiAward />,
      link: "/admin/manage/level",
      section: "data",
    },
    {
      text: "Qualification",
      icon: <FiAward />,
      link: "/admin/manage/qualification",
      section: "data",
    }, // Using Award for qual too
    {
      text: "Job Type",
      icon: <FiBriefcase />,
      link: "/admin/manage/teacher/jobtype",
      section: "data",
    },
    {
      text: "Exam",
      icon: <FiFileText />,
      link: "/admin/manage/exam",
      section: "data",
    },

    // Manage Requests
    {
      text: "Hiring",
      icon: <FiGlobe />,
      link: "/admin/manage/hiring",
      section: "requests",
    },
    {
      text: "Passkey",
      icon: <FiKey />,
      link: "/admin/manage/passkey",
      section: "requests",
    },
    {
      text: "Interview",
      icon: <FiVideo />,
      link: "/admin/manage/interview",
      section: "requests",
    },
    {
      text: "Job Applied",
      icon: <FiUserCheck />,
      link: "/admin/manage/teacher/applied/job",
      section: "requests",
    },
    {
      text: "Recruiter Enquiry",
      icon: <FiMessageSquare />,
      link: "/admin/manage/recruiter/enquiry",
      section: "requests",
    },
    {
      text: "Question Report",
      icon: <FiFlag />,
      link: "/admin/manage/question/report",
      section: "requests",
    },

    // Manage Users
    {
      text: "Teacher",
      icon: <FiUsers />,
      link: "/admin/manage/teacher",
      section: "users",
    },
    {
      text: "Recruiter",
      icon: <FiUser />,
      link: "/admin/manage/recruiter",
      section: "users",
    },
    {
      text: "Question Manager",
      icon: <FiHelpCircle />,
      link: "/admin/manage/question/manager",
      section: "users",
    },
    {
      text: "Exam Center",
      icon: <FiMapPin />,
      link: "/admin/manage/exam/center",
      section: "users",
    },
  ];

  // Group items
  const mainItems = menuItems.filter((item) => item.section === "main");
  const dataItems = menuItems.filter((item) => item.section === "data");
  const requestItems = menuItems.filter((item) => item.section === "requests");
  const userItems = menuItems.filter((item) => item.section === "users");

  const NavItem = ({ item }) => {
    const active = isActive(item.link);
    return (
      <Link
        to={item.link}
        className={`flex items-center px-3 py-2 mx-2 my-0.5 rounded-md transition-all duration-200 group ${
          active
            ? "bg-teal-600 text-white shadow-sm mx-3"
            : "text-gray-600 hover:bg-gray-100 hover:text-teal-600"
        }`}
      >
        <div
          className={`mr-3 p-1 rounded-full flex items-center justify-center transition-colors ${
            active
              ? "bg-teal-500 text-white"
              : "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
          }`}
        >
          {React.cloneElement(item.icon, { size: 16 })}
        </div>
        <span className="font-medium text-sm tracking-wide">{item.text}</span>
      </Link>
    );
  };

  const SectionHeader = ({ title }) => (
    <div className="px-5 py-1.5 mt-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
      {title}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onToggle}
      />

      {/* Sidebar Container */}
      <nav
        className={`fixed md:relative z-50 h-screen w-[240px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        } ${
          // On desktop, if isOpen is false, we might want to hide it completely or show mini sidebar?
          // Current requirement suggests standard toggle.
          // Layout.jsx logic handles the main content margin.
          // This simply handles sidebar visibility.
          ""
        }`}
        // If we want permanent sidebar on desktop that can collapse:
        // We'd need two states: mobileOpen and desktopCollapsed.
        // For simplicity: isOpen controls both. If desktop & !isOpen -> Hidden.
      >
        {/* Brand / Logo Area */}
        <div className="h-14 flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm flex-shrink-0">
          <h1 className="text-xl font-bold tracking-wider text-shadow-sm">
            PTPI
          </h1>
        </div>

        {/* Scrollable Nav Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-2 bg-gradient-to-b from-gray-50 to-white">
          <div className="py-2">
            {mainItems.map((item, idx) => (
              <NavItem key={`main-${idx}`} item={item} />
            ))}

            <SectionHeader title="Data Management" />
            {dataItems.map((item, idx) => (
              <NavItem key={`data-${idx}`} item={item} />
            ))}

            <SectionHeader title="Manage Requests" />
            {requestItems.map((item, idx) => (
              <NavItem key={`req-${idx}`} item={item} />
            ))}

            <SectionHeader title="Manage Users" />
            {userItems.map((item, idx) => (
              <NavItem key={`user-${idx}`} item={item} />
            ))}

            <div className="my-2 border-t border-gray-100" />

            {/* Settings Collapse */}
            <div className="mx-2 my-0.5">
              <button
                onClick={handleCollapseToggle}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 group ${
                  collapseOpen
                    ? "bg-gray-100 text-teal-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3 p-1 rounded-full bg-teal-50 text-teal-600 group-hover:bg-teal-100">
                    <FiSettings size={16} />
                  </div>
                  <span className="font-medium text-sm tracking-wide">
                    Settings
                  </span>
                </div>
                {collapseOpen ? (
                  <FiChevronUp size={14} />
                ) : (
                  <FiChevronDown size={14} />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  collapseOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  to="/admin/change/password"
                  className={`flex items-center pl-12 pr-4 py-1.5 mt-0.5 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin/change/password")
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-500 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  Change Password
                </Link>
                <Link
                  to="/admin/manage/backup"
                  className={`flex items-center pl-12 pr-4 py-1.5 mt-0.5 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin/manage/backup")
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-500 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  System Backup
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => handleLogout(dispatch, navigate)}
            className="w-full flex items-center justify-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-medium text-sm shadow-sm group"
          >
            <FiLogOut className="mr-2 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </nav>

      {/* Styles for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}
