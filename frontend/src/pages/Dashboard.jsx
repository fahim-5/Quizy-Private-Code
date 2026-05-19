import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import QuizCard from "../components/QuizCard";
import TeacherAnalytics from "../components/AdminAnalytics";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const quizUrl =
        user && user.role === "teacher" ? "/quizzes?all=true&mine=true" : "/quizzes";
      const [qRes, rRes] = await Promise.all([api.get(quizUrl), api.get("/results")]);

      setQuizzes(qRes.data.quizzes || qRes.data || []);
      setResults(rRes.data || []);
    } catch (err) {
      try {
        const qOnly = await api.get(
          user && user.role === "teacher" ? "/quizzes?all=true&mine=true" : "/quizzes",
        );
        setQuizzes(qOnly.data.quizzes || qOnly.data || []);
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData();
    const onVis = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // realtime clock for dashboard
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleStart(quiz) {
    navigate(`/quiz/${quiz._id}`);
  }

  return (
    <div className="page dashboard-page p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">
              Welcome back, {user?.name || user?.username || "Student"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to test your knowledge? Choose a quiz below to get started.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              {now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-sm text-gray-600">
              {now.toLocaleTimeString()}
            </div>
            <div>
              <button
                onClick={() => fetchData()}
                className="ml-4 px-3 py-1 border rounded text-sm"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        {user && user.role === "teacher" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Quizzes</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/teacher/create")}
                      className="px-3 py-1 bg-black text-white rounded-md"
                    >
                      Create Quiz
                    </button>
                    <button
                      onClick={() => navigate("/teacher")}
                      className="text-sm text-gray-600"
                    >
                      View all
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quizzes.length === 0 && (
                    <div className="col-span-full p-6 bg-white rounded shadow">
                      No quizzes available yet.
                    </div>
                  )}

                  {quizzes
                    .filter((q) => String(q.createdBy?._id || q.createdBy || "") === String(user._id))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3)
                    .map((q) => (
                      <div key={q._id} className="">
                        <QuizCard quiz={q} onStart={() => handleStart(q)} />
                      </div>
                    ))}
                </div>
              </section>
            </div>

            <div>
              <TeacherAnalytics />
            </div>
          </div>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Quizzes</h2>
              <div>
                <button onClick={() => navigate('/quizzes')} className="text-sm text-gray-600">View all</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quizzes.length === 0 && (
                <div className="col-span-full p-6 bg-white rounded shadow">No quizzes available yet.</div>
              )}

              {quizzes
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map((q) => (
                  <div key={q._id} className="">
                    <QuizCard quiz={q} onStart={() => handleStart(q)} />
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
