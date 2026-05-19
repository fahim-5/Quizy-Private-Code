import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth() || {};
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMine =
    params.get("mine") === "true" || (user && user.role === "teacher");
  const [showOnlyMine, setShowOnlyMine] = useState(initialMine);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const quizUrl = `/quizzes?subject=${id}&all=true${showOnlyMine ? "&mine=true" : ""}`;
        const [sRes, qRes] = await Promise.allSettled([
          api.get(`/subjects/${id}`),
          api.get(quizUrl),
        ]);
        if (!mounted) return;
        const subj =
          sRes.status === "fulfilled" ? sRes.value.data.subject : null;
        const qz =
          qRes.status === "fulfilled" ? qRes.value.data.quizzes || [] : [];
        setSubject(subj);
        setQuizzes(qz);
      } catch (err) {
        setError("Failed to load course data");
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
          {user && user.role === "teacher" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
              />
              <span>Show only my quizzes</span>
            </label>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/teacher/create?subject=${subject._id}`)}
              className="bg-black text-white px-4 py-2 rounded-md"
            >
              Add Quiz
            </button>
            <button
              onClick={() => navigate("/teacher")}
              className="border px-4 py-2 rounded-md"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div>
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
                              onClick={() => navigate(`/teacher/quiz/${q._id}`)}
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
      </div>
    </div>
  );
}
