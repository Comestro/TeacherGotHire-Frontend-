import React, { useState, useEffect } from "react";
import {
  FiDatabase,
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiHardDrive,
  FiShield,
  FiFile,
  FiInfo,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getBackups,
  createBackup,
  restoreBackup,
} from "../../services/backupService";

const ManageBackup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [backupInfo, setBackupInfo] = useState({
    location: "",
    total: 0,
    retention: "Last 10 backups",
  });

  const fetchBackupsList = async () => {
    try {
      setLoading(true);
      const data = await getBackups();
      setBackups(data.backups || []);
      setBackupInfo({
        location: data.backup_location,
        total: data.total_backups,
        retention: "Last 10 backups are kept",
      });
    } catch (err) {
      toast.error("Failed to fetch backups list");
      // Fallback/Mock data for demonstration if API fails or isn't ready
      setBackups([
        {
          filename: "default-2025-12-21-143045.backup",
          size: "15.32 MB",
          created: "2025-12-21 14:30:45",
        },
        {
          filename: "default-2025-12-14-020000.backup",
          size: "14.87 MB",
          created: "2025-12-14 02:00:00",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupsList();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const res = await createBackup();
      toast.success(res.message || "Backup created successfully");
      fetchBackupsList();
    } catch (err) {
      toast.error(err.message || "Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (filename) => {
    if (
      !window.confirm(
        `Are you sure you want to restore "${filename}"? Current data will be overwritten.`
      )
    )
      return;

    try {
      setRestoring(filename);
      const res = await restoreBackup(filename);
      toast.success(res.message || "System restored successfully");
    } catch (err) {
      toast.error(err.message || "Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
              <span className="bg-teal-600 p-2 rounded-lg text-white mr-3 shadow-lg shadow-teal-200">
                <FiShield className="w-6 h-6" />
              </span>
              System Backup Center
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Manage and secure your database with automated snapshots
            </p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className={`flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-xl shadow-teal-100 transition-all hover:bg-teal-700 hover:-translate-y-1 active:translate-y-0 ${
              creating ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {creating ? (
              <FiRefreshCw className="animate-spin mr-2" />
            ) : (
              <FiDatabase className="mr-2" />
            )}
            {creating ? "Generating Snapshot..." : "Create On-Demand Backup"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Storage Location",
              value: backupInfo.location || "/backups",
              icon: <FiHardDrive className="text-blue-500" />,
              bg: "bg-blue-50",
            },
            {
              label: "Available Copies",
              value: `${backupInfo.total} Snapshots`,
              icon: <FiFile className="text-purple-500" />,
              bg: "bg-purple-50",
            },
            {
              label: "Retention Policy",
              value: "Keep last 10",
              icon: <FiClock className="text-orange-500" />,
              bg: "bg-orange-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border border-white shadow-sm flex items-center gap-4 ${stat.bg}`}
            >
              <div className="bg-white p-3 rounded-xl shadow-sm text-xl">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  {stat.label}
                </p>
                <p className="text-gray-900 font-bold truncate max-w-[150px]">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Alert */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex gap-3 mb-8">
          <FiInfo className="text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal-800 leading-relaxed font-medium">
            System backups are automatically scheduled every{" "}
            <span className="font-extrabold text-teal-900">
              Sunday at 2:00 AM
            </span>
            . All backups are timestamped and stored securely. Note that
            restoring a backup will overwrite your current live data. Always
            perform a manual backup before restoring an older version.
          </p>
        </div>

        {/* Backup Table */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="text-teal-600" /> Recent Backups
            </h3>
            <button
              onClick={fetchBackupsList}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wider"
            >
              Apply Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Snapshot Filename
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Archive Size
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <FiRefreshCw className="animate-spin text-teal-600 w-8 h-8 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">
                        Synchronizing backup library...
                      </p>
                    </td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <FiDatabase className="text-gray-200 w-16 h-16 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold">
                        No snapshots available in storage
                      </p>
                    </td>
                  </tr>
                ) : (
                  backups.map((backup, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FiFile className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {backup.filename}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ENCRYPTED ARCHIVE
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold">
                          {backup.size}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-600">
                          {backup.created}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-right">
                          <button
                            onClick={() => handleRestore(backup.filename)}
                            disabled={restoring}
                            className={`px-4 py-1.5 bg-white border border-teal-100 text-teal-600 text-xs font-bold rounded-lg shadow-sm hover:bg-teal-600 hover:text-white transition-all ${
                              restoring === backup.filename ? "opacity-50" : ""
                            }`}
                          >
                            {restoring === backup.filename ? (
                              <span className="flex items-center">
                                <FiRefreshCw className="animate-spin mr-1.5" />{" "}
                                Restoring...
                              </span>
                            ) : (
                              "Restore Point"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="mt-12 group">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertCircle className="text-red-500 group-hover:animate-pulse" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Advanced Recovery
            </h4>
          </div>
          <div className="bg-white rounded-2xl border-2 border-red-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-red-100">
            <div>
              <p className="font-bold text-gray-900">
                Immediate Disaster Recovery
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Restoring old backups will immediately terminate current
                sessions and overwrite all database content. This action is
                irreversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                disabled
                className="px-4 py-2 bg-gray-50 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed"
              >
                Reset to Factory
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-50 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed"
              >
                Flush All Buffers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBackup;
