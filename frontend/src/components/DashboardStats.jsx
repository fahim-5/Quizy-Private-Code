import React from "react";

export default function DashboardStats({ stats = {} }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-sm text-gray-500">Users</h3>
        <p className="text-2xl font-semibold">{stats.users ?? 0}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-sm text-gray-500">Quizzes</h3>
        <p className="text-2xl font-semibold">{stats.quizzes ?? 0}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-sm text-gray-500">Results</h3>
        <p className="text-2xl font-semibold">{stats.results ?? 0}</p>
      </div>
    </section>
  );
}
