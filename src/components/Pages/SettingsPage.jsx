import { useState } from "react";
import { FiSettings, FiLock, FiShield, FiCheckCircle } from "react-icons/fi";
import { changePassword } from "../../services/authServices";
import ErrorMessage from "../ErrorMessage";

export default function SettingsPage() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setGeneralError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setGeneralError("Password must be at least 8 characters long");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setGeneralError("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setGeneralError(err.message || "Failed to change password. Please check your current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: "Weak", color: "bg-red-500" };
    if (strength <= 4) return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-teal-500 rounded-xl">
              <FiSettings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
              <p className="text-slate-500 mt-1">Manage your password and security</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          <ErrorMessage
            message={generalError}
            onDismiss={() => setGeneralError(null)}
          />
          <ErrorMessage
            message={successMessage}
            type="success"
            onDismiss={() => setSuccessMessage(null)}
          />
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FiLock className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                <p className="text-sm text-slate-500 mt-0.5">Update your password to keep your account secure</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordSubmit} className="p-8">
            <div className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Enter new password (min. 8 characters)"
                    required
                    minLength={8}
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">Password Strength</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.label === 'Weak' ? 'text-red-600' :
                        passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Re-enter your new password"
                    required
                  />
                </div>
                {passwordData.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-red-500" />
                        <span className="text-xs text-red-600 font-medium">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start gap-2 mb-2">
                  <FiShield className="w-4 h-4 text-slate-600 mt-0.5" />
                  <h4 className="text-sm font-semibold text-slate-700">Password Requirements</h4>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 ml-6">
                  <li className="flex items-center gap-2">
                    <span className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                      • At least 8 characters long
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      • Contains an uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      • Contains a lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                      • Contains a number
                    </span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-teal-200"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            For profile information updates, please visit your{" "}
            <a href="/teacher/personal-profile" className="text-teal-600 hover:text-teal-700 font-medium underline">
              Personal Profile Settings
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}