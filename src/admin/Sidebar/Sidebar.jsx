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
  FiInbox,
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
    {
      text: "Missing Subject",
      icon: <FiInbox />,
      link: "/admin/manage/missing-subject",
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
        className={`flex items-center px-2 py-1.5 mx-1 rounded transition-all duration-200 group ${
          active
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-50 hover:text-teal-600"
        }`}
      >
        <div
          className={`mr-2.5 w-6 h-6 rounded flex items-center justify-center transition-colors ${
            active
              ? "bg-teal-500 text-white"
              : "bg-slate-100 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600"
          }`}
        >
          {React.cloneElement(item.icon, { size: 12 })}
        </div>
        <span className="font-black text-[10px] uppercase tracking-wider">{item.text}</span>
      </Link>
    );
  };

  const SectionHeader = ({ title }) => (
    <div className="px-4 py-1 mt-2 mb-0.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
      {title}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop - Simplified */}
      <div
        className={`fixed inset-0 bg-slate-900/40 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onToggle}
      />

      {/* Sidebar Container - Ultra Compact */}
      <nav
        className={`fixed md:relative z-50 h-screen w-[230px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        {/* Brand Area - Sharp & Dense */}
        <div className="h-14 flex items-center px-4 gap-2.5 border-b border-slate-200 flex-shrink-0">
          <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white font-black text-sm">
            P
          </div>
          <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase">
            PTPI <span className="text-teal-600">Cabinet</span>
          </h1>
        </div>

        {/* Scrollable Nav Content - Dense Typography */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-4 px-2 space-y-0.5">
          <SectionHeader title="Core" />
          {mainItems.map((item, idx) => (
            <NavItem key={`main-${idx}`} item={item} />
          ))}

          <SectionHeader title="Database" />
          {dataItems.map((item, idx) => (
            <NavItem key={`data-${idx}`} item={item} />
          ))}

          <SectionHeader title="Verification" />
          {requestItems.map((item, idx) => (
            <NavItem key={`req-${idx}`} item={item} />
          ))}

          <SectionHeader title="Entities" />
          {userItems.map((item, idx) => (
            <NavItem key={`user-${idx}`} item={item} />
          ))}

          <div className="my-3 border-t border-slate-100" />

          {/* Settings Section - Compact */}
          <button
            onClick={handleCollapseToggle}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded transition-all duration-200 ${
              collapseOpen
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FiSettings size={12} className={collapseOpen ? "text-teal-400" : "text-slate-400"} />
              <span className="font-black text-[10px] uppercase tracking-wider">System</span>
            </div>
            {collapseOpen ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 mx-1 rounded-b ${
              collapseOpen ? "max-h-40 py-1 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {[
              { label: "Credentials", link: "/admin/change/password" },
              { label: "Archive", link: "/admin/manage/backup" }
            ].map((sub, i) => (
              <Link
                key={i}
                to={sub.link}
                className={`flex items-center pl-8 pr-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  isActive(sub.link)
                    ? "text-teal-600"
                    : "text-slate-400 hover:text-teal-600"
                }`}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>

        {/* User Session Footer - Sharp & Tonal */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={() => handleLogout(dispatch, navigate)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-300 text-slate-800 rounded hover:border-red-500 hover:text-red-600 transition-all font-black text-[9px] uppercase tracking-[0.2em]"
          >
            <FiLogOut size={12} />
            Terminate
          </button>
        </div>
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 0;
        }
      `}</style>
    </>
  );
}
