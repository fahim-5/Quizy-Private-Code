import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Courses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [onlyMyQuizzes, setOnlyMyQuizzes] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", enrollKey: "" });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "teacher") return;
    // For teachers, fetch only their courses so they see their own list
    fetchSubjects(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSubjects = async (onlyMine = false) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        onlyMine && user && user._id
          ? `/subjects?teacherId=${user._id}`
          : "/subjects";
      const res = await api.get(url);
      const list = (res && res.data && res.data.subjects) || [];
      setSubjects(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load subjects",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (user.role !== "teacher") return <div className="p-6">Access denied.</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Courses</h2>
        <div>
          <button
            onClick={() => setShowCreate(true)}
            className="mr-2 px-3 py-1 bg-green-600 text-white rounded-md"
          >
            Add Course
          </button>
          <button
            onClick={fetchSubjects}
            className="mr-2 px-3 py-1 border rounded-md text-black"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-3 py-1 bg-black text-white rounded-md"
          >
            Back
          </button>
        </div>
      </div>

      {loading && <p className="text-black">Loading courses...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enroll Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.map((s) => (
              <tr key={s._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {s.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {s.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {s.enrollKey}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <button
                    onClick={() =>
                      navigate(
                        `/teacher/courses/${s._id}${onlyMyQuizzes ? "?mine=true" : ""}`,
                      )
                    }
                    className="text-sm px-2 py-1 border rounded-md"
                  >
                    View Course
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm text-gray-500">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onlyMyQuizzes}
            onChange={(e) => setOnlyMyQuizzes(e.target.checked)}
          />
          Show only my quizzes when opening a course
        </label>
      </div>

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Course</h3>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Name</label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Code</label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Enroll Key</label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={form.enrollKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enrollKey: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-1 border rounded-md"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!form.name || !form.code || !form.enrollKey)
                    return setError("All fields required");
                  setCreating(true);
                  setError(null);
                  try {
                    const payload = {
                      name: form.name,
                      code: form.code,
                      enrollKey: form.enrollKey,
                    };
                    const res = await api.post("/subjects", payload);
                    setShowCreate(false);
                    setForm({ name: "", code: "", enrollKey: "" });
                    // refresh list after creation
                    fetchSubjects(true);
                    // optionally navigate to the created course
                    if (res?.data?.subject?._id)
                      navigate(
                        `/teacher/courses/${res.data.subject._id}?mine=true`,
                      );
                  } catch (err) {
                    setError(
                      err?.response?.data?.message ||
                        err.message ||
                        "Create failed",
                    );
                  } finally {
                    setCreating(false);
                  }
                }}
                className="px-3 py-1 bg-black text-white rounded-md"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
