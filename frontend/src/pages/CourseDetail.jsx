import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [takenResults, setTakenResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollKeyInput, setEnrollKeyInput] = useState("");
  const { user, token } = useAuth() || {};
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Default to the `mine` query param only. Do not force teachers to see only
  // their quizzes by default; allow them to toggle the checkbox if desired.
  const initialMine = params.get("mine") === "true";
  const [showOnlyMine, setShowOnlyMine] = useState(initialMine);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // first fetch subject (returns isEnrolled when logged in)
        const sRes = await api.get(
          `/subjects/${id}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );
        if (!mounted) return;
        const subj = sRes?.data?.subject;
        const enrolled = !!sRes?.data?.isEnrolled;
        setSubject(subj);
        setIsEnrolled(enrolled || (user && user.role === "teacher"));

        // If enrolled (or teacher), load quizzes
        if (enrolled || (user && user.role === "teacher")) {
          // Teachers should see only their quizzes for this course by default.
          // Only include the `mine=true` filter when we have an authenticated user,
          // otherwise the server will return 401 for that query parameter.
          const mineParam =
            (showOnlyMine || (user && user.role === "teacher")) && user
              ? "&mine=true"
              : "";
          const quizUrl = `/quizzes?subject=${id}&all=true${mineParam}`;
          const qRes = await api.get(
            quizUrl,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          );
          setQuizzes(qRes.data.quizzes || qRes.data || []);
          // if user is present, also fetch their completed results to detect taken quizzes
          if (user) {
            try {
              const rRes = await api.get(`/results/me`);
              const list = rRes?.data?.results || [];
              const map = {};
              list.forEach((r) => {
                const raw = r.quiz && (r.quiz._id || r.quiz);
                const qid = raw ? String(raw) : null;
                if (qid && r.status === "completed") {
                  map[qid] = r; // store latest completed result for this quiz
                }
              });
              setTakenResults(map);
            } catch (e) {
              // ignore
            }
          }
        } else {
          setQuizzes([]);
        }
      } catch (err) {
        console.error("CourseDetail fetch error:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load course data";
        const status = err?.response?.status;
        setError(status ? `${msg} (status: ${status})` : msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [id, showOnlyMine, user]);

  if (loading) return <div className="p-6">Loading course...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!subject) return <div className="p-6">Course not found</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{subject.name}</h1>
          <div className="text-sm text-gray-600">Code: {subject.code}</div>
        </div>
        <div className="flex items-center gap-4">
          {user && user.role === "teacher" ? (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate(`/teacher/create?subject=${subject._id}`)
                }
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                Add Quiz
              </button>
              <button
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Delete this course? This action cannot be undone.",
                    )
                  )
                    return;
                  setDeleting(true);
                  try {
                    await api.delete(
                      `/subjects/${subject._id}`,
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    navigate("/teacher/courses");
                  } catch (err) {
                    setError(
                      err?.response?.data?.message ||
                        err?.message ||
                        "Delete failed",
                    );
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Course"}
              </button>
              <button
                onClick={() => navigate("/teacher")}
                className="border px-4 py-2 rounded-md"
              >
                Back
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="text-xl md:text-2xl font-extrabold text-gray-900">
                  {subject.createdBy?.name ||
                    subject.createdBy?.identifier ||
                    "—"}
                </div>
                <div className="text-lg md:text-xl text-gray-700">
                  {subject.createdBy?.institution || ""}
                </div>
              </div>
              <button
                onClick={() => {
                  const email = subject.createdBy?.email;
                  if (email) window.location.href = `mailto:${email}`;
                }}
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Contact
              </button>
              <button
                onClick={() => navigate(-1)}
                className="border px-4 py-2 rounded-md"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        {!isEnrolled && user && user.role !== "teacher" ? (
          <div className="p-6 bg-yellow-50 border rounded">
            <h3 className="font-semibold mb-2">Enrollment required</h3>
            <p className="text-sm text-gray-700 mb-3">
              You must enroll in this course before viewing its quizzes.
            </p>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Enroll Key</label>
              <input
                value={enrollKeyInput}
                onChange={(e) => setEnrollKeyInput(e.target.value)}
                className="w-full border px-2 py-1 rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await api.post(
                      `/subjects/${subject._id}/enroll`,
                      { enrollKey: enrollKeyInput },
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    // reload quizzes
                    const qRes = await api.get(
                      `/quizzes?subject=${id}&all=true${showOnlyMine ? "&mine=true" : ""}`,
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    setQuizzes(qRes.data.quizzes || qRes.data || []);
                    setIsEnrolled(true);
                  } catch (err) {
                    setError(
                      err?.response?.data?.message ||
                        err.message ||
                        "Enroll failed",
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-3 py-1 bg-black text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Enrolling..." : "Enroll"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1 border rounded-md"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-3">Quizzes</h2>
            {quizzes.length === 0 ? (
              <div className="text-sm text-gray-600">
                No quizzes for this course yet.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizzes.map((q) => (
                      <tr key={q._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {q.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {q.joinCode || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {q.createdBy?.name || q.createdBy?.identifier || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          <div className="flex items-center gap-2">
                            {user && user.role === "teacher" ? (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(`/teacher/quiz/${q._id}`)
                                  }
                                  className="px-3 py-1 border rounded-md text-sm"
                                >
                                  Manage
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/teacher/monitor/${q._id}`)
                                  }
                                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                                >
                                  Monitor
                                </button>
                              </>
                            ) : takenResults[String(q._id)] ? (
                              <button
                                onClick={async () => {
                                  // fetch populated result then navigate to view
                                  const existing = takenResults[String(q._id)];
                                  const rid =
                                    existing && (existing._id || existing.id);
                                  try {
                                    const r = await api.get(`/results/${rid}`);
                                    const full = r?.data?.result || r?.data;
                                    navigate("/result", {
                                      state: { result: full },
                                    });
                                  } catch (err) {
                                    // fallback: navigate to results page with existing result
                                    navigate("/result", {
                                      state: { result: existing },
                                    });
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                              >
                                See Result
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/take/${q._id}`)}
                                className="px-3 py-1 bg-black text-white rounded-md text-sm"
                              >
                                Take Quiz
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
