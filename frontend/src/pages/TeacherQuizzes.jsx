import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import QuizzesTable from "../components/QuizzesTable";

export default function TeacherQuizzes() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "teacher") return;
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      // request teacher's quizzes (mine=true), include all to get drafts etc.
      const res = await api.get(
        "/quizzes?all=true&mine=true",
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      const list = res?.data?.quizzes || res?.data || [];
      // ensure only quizzes created by this teacher and sort by createdAt desc
      const filtered = (list || [])
        .filter(
          (q) =>
            String(q.createdBy?._id || q.createdBy || "") === String(user._id),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(filtered);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load quizzes",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    navigate(`/quiz/${q._id || q.id}`);
  };
  const handleManage = (q) => {
    navigate(`/teacher/quiz/${q._id || q.id}`);
  };
  const handleDelete = async (q) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      setLoading(true);
      await api.delete(
        `/quizzes/${q._id || q.id}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      await fetchQuizzes();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (q) => {
    if (!confirm(`Create a copy of \"${q.title}\"?`)) return;
    try {
      setLoading(true);
      await api.post(`/quizzes/${q._id || q.id}/duplicate`);
      await fetchQuizzes();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Copy failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMonitor = (q) => navigate(`/teacher/monitor/${q._id || q.id}`);
  const handleReport = (q) => navigate(`/teacher/reports/${q._id || q.id}`);

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === "draft") return q.status === "draft" || q.draft;
    if (filter === "published")
      return q.status === "published" || q.visibleFrom;
    if (query && query.trim()) {
      const t = (q.title || q.name || "").toLowerCase();
      return t.includes(query.trim().toLowerCase());
    }
    return true;
  });

  if (!user) return null;
  if (user.role !== "teacher") return <div className="p-6">Access denied</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">My Quizzes</h2>
          <div className="text-sm text-gray-600">
            Showing your quizzes (newest first)
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
            <input
              placeholder="Search quizzes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none text-sm px-2 w-48"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm bg-transparent outline-none"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button
            onClick={fetchQuizzes}
            className="border border-gray-300 text-black px-3 py-1 rounded-md mr-2 hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/teacher/create")}
            className="px-3 py-1 bg-black text-white rounded-md"
          >
            Create Quiz
          </button>
        </div>
      </div>

      {loading && <p className="text-black">Loading quizzes...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <QuizzesTable
          quizzes={filteredQuizzes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManage={handleManage}
          onCopy={handleCopy}
          onMonitor={handleMonitor}
          onReport={handleReport}
        />
      </div>
    </div>
  );
}
