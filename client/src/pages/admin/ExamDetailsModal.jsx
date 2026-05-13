import React from "react";
import { X, FilePenLine } from "lucide-react";

const ExamDetailsModal = ({
  exam,
  results = [],
  loading,
  onClose,
}) => {

  if (!exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="flex items-start justify-between border-b px-8 py-6">

          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {exam.name}
            </h2>

            <p className="text-slate-500 mt-1 capitalize">
              {exam.subject}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={24} />
          </button>

        </div>

        {/* BODY */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

            <div className="bg-slate-50 rounded-2xl p-5 border">
              <p className="text-sm text-slate-500">
                Duration
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {exam.duration} min
              </h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border">
              <p className="text-sm text-slate-500">
                Total Marks
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {exam.totalMarks}
              </h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border">
              <p className="text-sm text-slate-500">
                Passing Marks
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {exam.passingMarks}
              </h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border">
              <p className="text-sm text-slate-500">
                Total Attempts
              </p>

              <h3 className="text-2xl font-bold mt-2">
                {results.length}
              </h3>
            </div>

          </div>

          {/* RESULTS HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Student Results
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                View all student performances for this exam
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 bg-violet-600 text-white px-5 py-3 rounded-2xl hover:bg-violet-700 transition font-medium">

              <FilePenLine size={18} />

              Edit Exam

            </button>

          </div>

          {/* CONTENT */}
          {
            loading ? (

              <div className="text-center py-16 text-slate-500 text-lg">
                Loading results...
              </div>

            ) : results.length === 0 ? (

              <div className="border rounded-3xl py-16 text-center text-slate-500 bg-slate-50">
                No students attempted this exam yet.
              </div>

            ) : (

              <div className="overflow-hidden rounded-3xl border">

                <table className="w-full">

                  <thead className="bg-slate-50">

                    <tr className="text-left text-slate-600">

                      <th className="p-5 font-semibold">
                        Student
                      </th>

                      <th className="p-5 font-semibold">
                        Email
                      </th>

                      <th className="p-5 font-semibold">
                        Score
                      </th>

                      <th className="p-5 font-semibold">
                        Submitted
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {
                      results.map((result) => (

                        <tr
                          key={result._id}
                          className="border-t hover:bg-slate-50 transition"
                        >

                          <td className="p-5 font-medium text-slate-900">
                            {result.student?.name || "Unknown"}
                          </td>

                          <td className="p-5 text-slate-500">
                            {result.student?.email || "No email"}
                          </td>

                          <td className="p-5">

                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                              {result.score}
                            </span>

                          </td>

                          <td className="p-5 text-slate-500">
                            {
                              new Date(
                                result.createdAt
                              ).toLocaleString()
                            }
                          </td>

                        </tr>

                      ))
                    }

                  </tbody>

                </table>

              </div>

            )
          }

        </div>

      </div>

    </div>
  );
};

export default ExamDetailsModal;