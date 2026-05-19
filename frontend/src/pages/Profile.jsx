import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaChalkboardTeacher,
  FaEnvelope,
  FaIdBadge,
  FaSchool,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/users/me");
      setProfile(res.data.data || res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Something went wrong
          </h2>

          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              My Profile
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your account information and activities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-300"
            >
              <FaArrowLeft size={14} />
              Back
            </button>

            <button
              onClick={() => logout && logout()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition-all duration-300 shadow-md"
            >
              <FaSignOutAlt size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl overflow-hidden">
          {/* Top Banner */}
          <div className="h-40 bg-gradient-to-r from-black via-gray-800 to-black relative" />

          {/* Profile Section */}
          <div className="px-8 pb-8">
            <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-black text-white flex items-center justify-center text-5xl font-bold">
                {(profile.name || profile.identifier || "U")[0].toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900">
                  {profile.name || profile.identifier}
                </h2>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <FaEnvelope />
                    {profile.email}
                  </div>

                  <div className="flex items-center gap-2">
                    <FaUserShield />
                    {profile.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
              {/* Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                    <FaIdBadge />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Identifier
                    </p>

                    <h3 className="font-semibold text-gray-900">
                      {profile.identifier}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                    <FaSchool />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Institution
                    </p>

                    <h3 className="font-semibold text-gray-900">
                      {profile.institution || "Not Added"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Account Status
                </p>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Joined */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Joined On
                </p>

                <h3 className="font-semibold text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <button
                onClick={() => navigate(`/teacher`)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-gray-900 transition-all duration-300 shadow-lg"
              >
                <FaChalkboardTeacher />
                Manage Quizzes
              </button>

              <button
                onClick={() => navigate(`/teacher/courses`)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-300"
              >
                <FaBook />
                My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}