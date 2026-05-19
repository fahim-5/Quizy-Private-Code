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
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Change password
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
