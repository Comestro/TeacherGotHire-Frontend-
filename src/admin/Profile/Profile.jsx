import React from "react";
import { FiMail, FiPhone, FiLinkedin, FiTwitter } from "react-icons/fi";
import { BsCalendarCheck, BsClockHistory, BsPerson } from "react-icons/bs";
import { IoSchoolOutline } from "react-icons/io5";
import { MdWorkOutline, MdOutlineMessage } from "react-icons/md";
import Layout from "../Admin/Layout";

export default function AdminProfile() {
  const adminData = {
    name: "Site Admin",
    role: "Site Administrator",
    bio: "Dedicated platform administrator with 5+ years of experience in educational technology management",
    profileImage:
      "images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    contact: {
      email: "sarah.johnson@eduportal.com",
      phone: "+1 (555) 123-4567",
      linkedin: "linkedin.com/sarahjohnson",
      twitter: "@sarahjadmin",
    },
    stats: {
      profilesApproved: 1234,
      testsUpdated: 456,
      queriesHandled: 789,
      activeHours: 2500,
    },
    recentActivities: [
      {
        action: "Approved Teacher Profile - John Smith",
        timestamp: "2 hours ago",
      },
      { action: "Updated Mathematics Skill Test", timestamp: "4 hours ago" },
      { action: "Resolved Technical Query #4521", timestamp: "1 day ago" },
      { action: "System Maintenance Check", timestamp: "2 days ago" },
    ],
    additionalInfo: {
      joined: "January 15, 2020",
      workingHours: "9:00 AM - 5:00 PM EST",
    },
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-teal-400"></div>
            <div className="px-6 py-4 relative">
              <div className="flex items-center">
                <img
                  src={adminData.profileImage}
                  alt="Admin Profile"
                  className="w-32 h-32 rounded-full border-4 border-white absolute -mt-20"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80";
                  }}
                />
                <div className="ml-40">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {adminData.name}
                  </h1>
                  <p className="text-lg text-gray-600">{adminData.role}</p>
                  <p className="text-gray-500 mt-1">{adminData.bio}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiMail className="text-blue-500 mr-3" />
                  <span>{adminData.contact.email}</span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="text-blue-500 mr-3" />
                  <span>{adminData.contact.phone}</span>
                </div>
                <div className="flex items-center">
                  <FiLinkedin className="text-blue-500 mr-3" />
                  <span>{adminData.contact.linkedin}</span>
                </div>
                <div className="flex items-center">
                  <FiTwitter className="text-blue-500 mr-3" />
                  <span>{adminData.contact.twitter}</span>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <BsPerson className="text-blue-500 text-xl mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {adminData.stats.profilesApproved}
                  </div>
                  <div className="text-sm text-gray-600">Profiles Approved</div>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <IoSchoolOutline className="text-teal-500 text-xl mb-2" />
                  <div className="text-2xl font-bold text-teal-600">
                    {adminData.stats.testsUpdated}
                  </div>
                  <div className="text-sm text-gray-600">Tests Updated</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <MdOutlineMessage className="text-purple-500 text-xl mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {adminData.stats.queriesHandled}
                  </div>
                  <div className="text-sm text-gray-600">Queries Handled</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <BsClockHistory className="text-green-500 text-xl mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {adminData.stats.activeHours}
                  </div>
                  <div className="text-sm text-gray-600">Active Hours</div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <BsCalendarCheck className="text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-medium">
                      {adminData.additionalInfo.joined}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MdWorkOutline className="text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Working Hours</p>
                    <p className="font-medium">
                      {adminData.additionalInfo.workingHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {adminData.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                    <span className="text-gray-700">{activity.action}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
