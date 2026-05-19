import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

export default function Settings() {
  const { user, login } = useAuth() || {};
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    institution: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me");
        const data = res.data.data || res.data;
        setForm({
          name: data.name || "",
          email: data.email || "",
          institution: data.institution || "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return navigate("/login");
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/users/${user._id}`, form);
      const updated = res.data.data || res.data;
      // update auth context
      login && login(updated, localStorage.getItem("token"));
      setSuccess("Profile updated");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(`/users/${user._id}/password`, {
        currentPassword,
        newPassword,
      });
      setSuccess("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Password change failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // Verification/modal state for email/password change
  const [needsVerify, setNeedsVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);

  const sendVerificationIfNeeded = async () => {
    // send code to the new email if email changed or password change requested
    try {
      await api.post("/auth/forgot-password", { email: form.email.trim().toLowerCase() });
      setVerifyMessage("Verification code sent to email");
      setNeedsVerify(true);
    } catch (err) {
      throw new Error(err?.response?.data?.message || err.message || "Failed to send verification code");
    }
  };

  const applyUpdatesAfterVerify = async () => {
    // perform password change first (if requested), then profile update
    try {
      if (newPassword) {
        await api.put(`/users/${user._id}/password`, {
          currentPassword,
          newPassword,
        });
      }

      const res = await api.put(`/users/${user._id}`, form);
      const updated = res.data.data || res.data;
      login && login(updated, localStorage.getItem("token"));
      setSuccess("Profile updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      throw new Error(err?.response?.data?.message || err.message || "Update failed");
    }
  };

  const handleSaveUpdate = async () => {
    if (!user) return navigate("/login");
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const emailChanged = form.email && form.email.toLowerCase() !== (user.email || "").toLowerCase();
      const passwordChangeRequested = newPassword && newPassword.length > 0;

      if (emailChanged || passwordChangeRequested) {
        // send verification code and show modal
        await sendVerificationIfNeeded();
        setLoading(false);
        return;
      }

      // no verification needed, do immediate save
      const res = await api.put(`/users/${user._id}`, form);
      const updated = res.data.data || res.data;
      login && login(updated, localStorage.getItem("token"));
      setSuccess("Profile updated");
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerifyLoading(true);
    setError(null);
    try {
      if (!/^\d{6}$/.test(verifyCode)) throw new Error("Enter the 6-digit code");
      await api.post("/auth/verify-reset", { email: form.email.trim().toLowerCase(), code: verifyCode.trim() });
      // code valid, apply updates
      await applyUpdatesAfterVerify();
      setNeedsVerify(false);
      setVerifyCode("");
      setVerifyMessage(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {success && <div className="mb-3 text-green-600">{success}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-black">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Institution
            </label>
            <input
              value={form.institution}
              onChange={(e) =>
                setForm((f) => ({ ...f, institution: e.target.value }))
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div className="mt-4 p-4 border rounded">
            <h3 className="font-medium mb-2">Change Password</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-black">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-black">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div className="flex gap-2">
                {/* password change will be applied when saving updates */}
                <div className="text-sm text-gray-500">Password will be updated when you click Save Update</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveUpdate}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save Update"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>

          {needsVerify && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-2">Verify change</h3>
                <p className="text-sm mb-3">{verifyMessage || "Enter the 6-digit code sent to your email"}</p>
                <input
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, "").slice(0,6))}
                  placeholder="6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full border px-2 py-1 rounded mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setNeedsVerify(false); setVerifyCode(""); setVerifyMessage(null); }}
                    className="px-3 py-1 border rounded"
                    disabled={verifyLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    className="px-3 py-1 bg-black text-white rounded"
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
