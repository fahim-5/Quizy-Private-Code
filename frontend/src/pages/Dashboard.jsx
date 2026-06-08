import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import QuizCard from "../components/QuizCard";
import TeacherAnalytics from "../components/AdminAnalytics";

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
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
      // For students we need quizzes, their own results, and subjects
      if (user && user.role === "teacher") {
        const [qRes, sRes] = await Promise.all([
          api.get(
            quizUrl,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
          api.get(
            "/subjects",
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
        ]);
        setQuizzes(qRes.data.quizzes || qRes.data || []);
        setSubjects((sRes && (sRes.data.subjects || sRes.data)) || []);
        setResults([]);
      } else {
        const [qRes, rRes, sRes] = await Promise.all([
          api.get(
            quizUrl,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
          api.get(
            "/results/me",
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
          api.get(
            "/subjects",
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
        ]);
        setQuizzes(qRes.data.quizzes || qRes.data || []);
        setResults((rRes && (rRes.data?.results || rRes.data)) || []);
        setSubjects((sRes && (sRes.data.subjects || sRes.data)) || []);
      }
    } catch (err) {
      try {
        const qOnly = await api.get(
          user && user.role === "teacher"
            ? "/quizzes?all=true&mine=true"
            : "/quizzes",
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
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
    if (location?.pathname && location.pathname.startsWith("/dashboard")) {
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
              <h2 className="text-xl font-semibold">
                Available Quizzes for You
              </h2>
            </div>

            {/* Show up to 6 quizzes (3 columns) from enrolled courses only — prefer unattempted first */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(() => {
                const enrolled = subjects.filter((s) => s.isEnrolled);
                if (!enrolled || enrolled.length === 0) {
                  return (
                    <div className="col-span-full p-6 bg-white rounded shadow">
                      No enrolled courses yet.
                    </div>
                  );
                }

                const enrolledIds = new Set(enrolled.map((s) => String(s._id)));
                const candidateQuizzes = (quizzes || []).filter(
                  (q) =>
                    q &&
                    q.subject &&
                    enrolledIds.has(String(q.subject._id || q.subject)),
                );

                const attemptedQuizIds = new Set(
                  (results || [])
                    .map((r) =>
                      r.quiz?._id ? String(r.quiz._id) : String(r.quiz),
                    )
                    .filter(Boolean),
                );

                const unattempted = candidateQuizzes
                  .filter((q) => !attemptedQuizIds.has(String(q._id)))
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
                  );

                const attempted = candidateQuizzes
                  .filter((q) => attemptedQuizIds.has(String(q._id)))
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
                  );

                const list = [...unattempted, ...attempted].slice(0, 6);

                if (list.length === 0) {
                  return (
                    <div className="col-span-full p-6 bg-white rounded shadow">
                      No quizzes available from your enrolled courses.
                    </div>
                  );
                }

                return list.map((q) => (
                  <div key={q._id}>
                    <QuizCard quiz={q} onStart={() => handleStart(q)} />
                  </div>
                ));
              })()}
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
                        token
                          ? { headers: { Authorization: `Bearer ${token}` } }
                          : undefined,
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
