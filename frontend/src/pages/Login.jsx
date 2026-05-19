import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/images/logo.png";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
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
        auth.login(user);
      }

      navigate("/");
    } catch (err) {
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
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <div className="absolute right-0 top-0 mt-2 mr-2 text-sm">
              <Link to="/forgot" className="text-black underline">
                Forgot?
              </Link>
            </div>
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
