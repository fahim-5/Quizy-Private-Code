import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/images/logo.png";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const input = id.trim();
      const isEmail = /^\S+@\S+\.\S+$/.test(input);
      const payload = isEmail
        ? { email: input.toLowerCase(), password }
        : { id: input, password };
      const res = await api.post("/auth/login", payload);

      const token = res?.data?.token;
      const user = res?.data?.data?.user;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (user && auth?.login) {
        auth.login(user, token);
      }

      navigate(
        user && user.role === "teacher"
          ? "/dashboard/teacher"
          : "/dashboard/student",
      );
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError("Wrong password");
      else
        setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="Quizly" className="h-12 mb-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID or email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="w-full border border-gray-300 rounded-md px-3 pr-10 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              type="button"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-700 hover:opacity-80"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 014.125.875"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="text-right text-sm mt-1">
            <Link to="/forgot" className="text-red-600 underline">
              Forgot password?
            </Link>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-3 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-black font-medium underline">
              Registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
