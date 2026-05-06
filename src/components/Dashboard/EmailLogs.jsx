import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HiOutlineMail, HiOutlineMailOpen } from "react-icons/hi";

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axiosPrivate.get("/teacherhire/emaillogs/");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Email Notifications</h1>
        <p className="text-slate-500">View all emails sent to your account.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
        {/* Logs List */}
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
            Inbox History
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <p className="p-4 text-center text-slate-500">Loading...</p>
            ) : logs.length === 0 ? (
              <p className="p-4 text-center text-slate-500">No notifications found.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedLog?.id === log.id
                      ? "bg-teal-50 border-teal-200"
                      : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`p-2 rounded-full ${selectedLog?.id === log.id ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                      {selectedLog?.id === log.id ? <HiOutlineMailOpen className="w-5 h-5" /> : <HiOutlineMail className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate" title={log.subject}>
                        {log.subject}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(log.sent_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Log Viewer */}
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {selectedLog ? (
            <>
              <div className="p-6 border-b border-slate-200 bg-white">
                <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedLog.subject}</h2>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Sent: {formatDate(selectedLog.sent_at)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedLog.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedLog.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
                <div 
                  className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 min-h-full"
                  dangerouslySetInnerHTML={{ __html: selectedLog.body_html }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
              <HiOutlineMailOpen className="w-16 h-16 mb-4 text-slate-300" />
              <p>Select a notification to view its content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailLogs;
