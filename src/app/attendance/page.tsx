"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  addSubject,
  getSubjects,
  markAttendance,
  unmarkAttendance, // Make sure your lib/idb.ts has this
  getAttendanceStatus,
  getAttendanceStats,
  deleteSubject,
} from "@/lib/idb";

// === AttendanceRing component ===
function AttendanceRing({ percent }: { percent: number }) {
  const radius = 28;
  const stroke = 7;
  const normalizedRadius = radius - stroke;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.min(percent, 100);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={55} height={55}>
      <circle
        stroke="#e5e7eb"
        strokeWidth={stroke}
        fill="none"
        cx={radius}
        cy={radius}
        r={normalizedRadius}
      />
      <circle
        stroke="#2563eb"
        strokeWidth={stroke}
        fill="none"
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.5s ease"
        }}
      />
      <text
        x="55%"
        y="53%"
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize="0.90em"
        fill="#2563eb"
        fontWeight={700}
      >
        {percent}%
      </text>
    </svg>
  );
}

// === SubjectCard component ===
function SubjectCard({
  subject,
  onRequestDelete,
 
}: {
  subject: { id: string; name: string };
  onRequestDelete: (subject: { id: string; name: string }) => void;
  fetchSubjects: () => void;
}) {
  const [todayStatus, setTodayStatus] = useState<"present" | "absent" | "loading">("loading");
  const [stats, setStats] = useState({ present: 0, total: 0, percent: 0 });
  const todayStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  useEffect(() => {
    fetchTodayStatus();
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchTodayStatus = async () => {
    const status = await getAttendanceStatus(subject.id, todayStr);
    setTodayStatus(status === "present" ? "present" : "absent");
  };

  const fetchStats = async () => {
    const s = await getAttendanceStats(subject.id); // should only count weekdays!
    setStats(s);
  };

  const handlePresent = async (e: any) => {
    e.stopPropagation();
    await markAttendance(subject.id, todayStr);
    toast.success(`Marked present for ${subject.name}`);
    fetchTodayStatus();
    fetchStats();
  };

  const handleAbsent = async (e: any) => {
    e.stopPropagation();
    await unmarkAttendance(subject.id, todayStr);
    toast.success(`Marked absent/undone for ${subject.name}`);
    fetchTodayStatus();
    fetchStats();
  };

  const handleDeleteRequest = (e: any) => {
    e.stopPropagation();
    onRequestDelete(subject);
  };

  const router = useRouter();
  const navigateToCalendar = () => {
    router.push(`/subject/${subject.id}`);
  };

  return (
    <li
      className="border border-gray-300 p-5 rounded-xl shadow-sm bg-white flex justify-between items-center gap-4 hover:shadow-md transition-shadow cursor-pointer "
      onClick={navigateToCalendar}
      tabIndex={0}
      title={`Go to calendar for "${subject.name}"`}
    >
      <div className="flex items-center gap-3 flex-1">
        <AttendanceRing percent={stats.percent || 0} />
        <span className="text-2xl font-semibold text-gray-800">{subject.name}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handlePresent}
          className={`px-3 py-1 rounded transition ${todayStatus === "present"
              ? "bg-green-500 text-white cursor-not-allowed opacity-70"
              : "bg-gray-800 text-white hover:bg-gray-700"}`}
          disabled={todayStatus === "present"}
        >
          Present
        </button>
        <button
          onClick={handleAbsent}
          className={`px-3 py-1 rounded transition ${todayStatus === "absent"
              ? "bg-red-500 text-white cursor-not-allowed opacity-70"
              : "bg-gray-800 text-white hover:bg-gray-700"}`}
          disabled={todayStatus === "absent"}
        >
          Absent
        </button>
        <button
          onClick={handleDeleteRequest}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          🗑
        </button>
      </div>
    </li>
  );
}

// === MAIN PAGE ===

export default function Home() {
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchSubjects = async () => {
    const list = await getSubjects();
    setSubjects(list);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = async () => {
    if (newSubject.trim() === "") return;
    await addSubject(newSubject.trim());
    setNewSubject("");
    setModalOpen(false);
    toast.success("Subject added!");
    fetchSubjects();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteSubject(deleteTarget.id);
    toast.success(`Deleted ${deleteTarget.name}`);
    setDeleteTarget(null);
    fetchSubjects();
  };

  return (
    <main className="p-6 max-w-2xl mx-auto min-h-screen pb-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Attendance Tracker</h1>

      <ul className="space-y-5">
        {subjects.length === 0 && (
          <li className="text-center text-gray-500">No subjects yet.</li>
        )}
        {subjects.map((subj) => (
          <SubjectCard
            key={subj.id}
            subject={subj}
            onRequestDelete={setDeleteTarget}
            fetchSubjects={fetchSubjects}
          />
        ))}
      </ul>

      <button
        className="fixed bottom-24 right-6 bg-blue-600 text-white text-3xl w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 transition"
        onClick={() => setModalOpen(true)}
        aria-label="Add Subject"
      >
        +
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">Add New Subject</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter subject name"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >Cancel</button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >Add</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-[90%] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Confirm Delete
            </h3>
            <p className="mb-6 text-center">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> and all its attendance?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setDeleteTarget(null)}
              >Cancel</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
