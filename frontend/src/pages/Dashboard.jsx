import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import QuizCard from "../components/QuizCard";
import TeacherAnalytics from "../components/AdminAnalytics";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollModal, setEnrollModal] = useState({
    show: false,
    subject: null,
    enrollKey: "",
    error: null,
    loading: false,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const quizUrl =
        user && user.role === "teacher"
          ? "/quizzes?all=true&mine=true"
          : "/quizzes";
      const calls = [api.get(quizUrl), api.get("/results")];
      // also fetch subjects for students view
      calls.push(api.get("/subjects"));
      const [qRes, rRes, sRes] = await Promise.all(calls);

      setQuizzes(qRes.data.quizzes || qRes.data || []);
      setResults(rRes.data || []);
      setSubjects((sRes && (sRes.data.subjects || sRes.data)) || []);
    } catch (err) {
      try {
        const qOnly = await api.get(
          user && user.role === "teacher"
            ? "/quizzes?all=true&mine=true"
            : "/quizzes",
        );
        setQuizzes(qOnly.data.quizzes || qOnly.data || []);
        // attempt to load subjects as fallback
        try {
          const sOnly = await api.get("/subjects");
          setSubjects(sOnly.data.subjects || sOnly.data || []);
        } catch (e) {}
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

  // Re-fetch when the route changes back to the dashboard (fixes missing courses after navigation)
  useEffect(() => {
    if (location?.pathname === "/dashboard") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname]);

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
              Welcome back, {user?.name || user?.username || "Student"}! 💚
            </h1>
            <p className="text-gray-600 mt-1"></p>
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
                    .filter(
                      (q) =>
                        String(q.createdBy?._id || q.createdBy || "") ===
                        String(user._id),
                    )
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
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
              <h2 className="text-xl font-semibold">Available Courses</h2>
              <div>
                <button
                  onClick={() => navigate("/courses")}
                  className="text-sm text-gray-600"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {subjects.length === 0 && (
                <div className="col-span-full p-6 bg-white rounded shadow">
                  No courses available yet.
                </div>
              )}

              {subjects
                .sort(
                  (a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
                )
                .slice(0, 9)
                .map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded shadow p-6 h-56 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {s.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Code: {s.code || "-"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={async () => {
                          // For students, show enroll modal if not enrolled; for teachers navigate
                          if (user && user.role === "teacher") {
                            navigate(`/teacher/courses/${s._id}`);
                            return;
                          }
                          try {
                            const res = await api.get(`/subjects/${s._id}`);
                            const isEnrolled = res.data && res.data.isEnrolled;
                            if (isEnrolled) {
                              navigate(`/courses/${s._id}`);
                            } else {
                              setEnrollModal({
                                show: true,
                                subject: res.data.subject || s,
                                enrollKey: "",
                                error: null,
                                loading: false,
                              });
                            }
                          } catch (err) {
                            setEnrollModal({
                              show: true,
                              subject: s,
                              enrollKey: "",
                              error: null,
                              loading: false,
                            });
                          }
                        }}
                        className="w-full px-4 py-2 bg-black text-white rounded-md"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
        {enrollModal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-md w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Enroll in {enrollModal.subject?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter the enroll key provided by the instructor to join this
                course.
              </p>
              {enrollModal.error && (
                <div className="text-red-600 mb-2">{enrollModal.error}</div>
              )}
              <div className="mb-3">
                <label className="block text-sm text-gray-700">
                  Enroll Key
                </label>
                <input
                  className="w-full border px-2 py-1 rounded-md"
                  value={enrollModal.enrollKey}
                  onChange={(e) =>
                    setEnrollModal((m) => ({ ...m, enrollKey: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() =>
                    setEnrollModal({
                      show: false,
                      subject: null,
                      enrollKey: "",
                      error: null,
                      loading: false,
                    })
                  }
                  className="px-3 py-1 border rounded-md"
                  disabled={enrollModal.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setEnrollModal((m) => ({
                      ...m,
                      loading: true,
                      error: null,
                    }));
                    try {
                      await api.post(
                        `/subjects/${enrollModal.subject._id}/enroll`,
                        { enrollKey: enrollModal.enrollKey },
                      );
                      // go to course after successful enroll
                      navigate(`/courses/${enrollModal.subject._id}`);
                      setEnrollModal({
                        show: false,
                        subject: null,
                        enrollKey: "",
                        error: null,
                        loading: false,
                      });
                    } catch (err) {
                      setEnrollModal((m) => ({
                        ...m,
                        loading: false,
                        error:
                          err?.response?.data?.message ||
                          err.message ||
                          "Enroll failed",
                      }));
                    }
                  }}
                  className="px-3 py-1 bg-black text-white rounded-md"
                  disabled={enrollModal.loading}
                >
                  {enrollModal.loading ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
