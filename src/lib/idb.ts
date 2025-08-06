import { openDB, IDBPDatabase, DBSchema } from "idb";
import { eachDayOfInterval, isWeekend, addDays } from "date-fns";

interface AttendanceDB extends DBSchema {
  subjects: {
    key: string;
    value: { id: string; name: string; createdAt: string }; // Added createdAt
  };
  attendance: {
    key: string;
    value: { id: string; subjectId: string; date: string; status: string };
  };
}

let dbPromise: Promise<IDBPDatabase<AttendanceDB>> | null = null;

function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
}

function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is not available on the server");
  }
  if (!dbPromise) {
    dbPromise = openDB<AttendanceDB>("attendance-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("subjects")) {
          db.createObjectStore("subjects", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("attendance")) {
          db.createObjectStore("attendance", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

// ------ SUBJECTS

export const addSubject = async (name: string) => {
  let created = new Date();
  // If today is Saturday (6), add 2 days; if Sunday (0), add 1 day
  if (created.getDay() === 6) {
    created = addDays(created, 2);
  } else if (created.getDay() === 0) {
    created = addDays(created, 1);
  }
  const db = await getDB();
  await db.add("subjects", {
    id: crypto.randomUUID(),
    name,
    createdAt: created.toISOString().slice(0, 10), // Store adjusted creation date
  });
};

export const getSubjects = async () => {
  const db = await getDB();
  return db.getAll("subjects");
};

export const getAllSubjects = getSubjects;

export const getSubjectById = async (subjectId: string) => {
  const db = await getDB();
  return db.get("subjects", subjectId);
};

export const deleteSubject = async (subjectId: string) => {
  const db = await getDB();
  await db.delete("subjects", subjectId);
  // Remove all attendance records for this subject
  const all = await db.getAll("attendance");
  const related = all.filter((a) => a.subjectId === subjectId);
  for (const record of related) {
    await db.delete("attendance", record.id);
  }
};

// ------ ATTENDANCE

// Mark present for a specific date (defaults to today)
export const markAttendance = async (subjectId: string, dateInput?: string) => {
  const todayStr = getTodayDateString();
  const date = dateInput || todayStr;
  const id = `${subjectId}_${date}`;
  const db = await getDB();
  await db.put("attendance", {
    id,
    subjectId,
    date,
    status: "present",
  });
};

// Undo (unmark) attendance: remove present mark for a given date
export const unmarkAttendance = async (subjectId: string, dateInput?: string) => {
  const todayStr = getTodayDateString();
  const date = dateInput || todayStr;
  const id = `${subjectId}_${date}`;
  const db = await getDB();
  await db.delete("attendance", id);
};

// Retrieve attendance records by subject
export const getAttendanceBySubject = async (subjectId: string) => {
  const db = await getDB();
  const all = await db.getAll("attendance");
  return all.filter((a) => a.subjectId === subjectId);
};

// Retrieve attendance records for all subjects on a date
export const getAttendanceByDate = async (date: string) => {
  const db = await getDB();
  const all = await db.getAll("attendance");
  return all.filter((a) => a.date === date);
};

// Get present/absent status for a subject on a date ("present" | "absent")
export const getAttendanceStatus = async (subjectId: string, date: string) => {
  const db = await getDB();
  const id = `${subjectId}_${date}`;
  const record = await db.get("attendance", id);
  if (record && record.status === "present") return "present";
  return "absent";
};

// ------ STATS

export const getAttendanceStats = async (subjectId: string) => {
  const db = await getDB();
  const subject = await db.get("subjects", subjectId);

  if (!subject) {
    return { present: 0, total: 0, percent: 0 };
  }

  const allAttendance = await db.getAll("attendance");
  const subjectRecords = allAttendance.filter((a) => a.subjectId === subjectId);

  // Present days set
  const presentDates = new Set(
    subjectRecords.filter((r) => r.status === "present").map((r) => r.date)
  );
  const present = presentDates.size;

  // Use subject creation date as start date
  const startDate = new Date(subject.createdAt);
  const endDate = new Date(getTodayDateString());

  // Count all possible weekdays between [startDate, endDate], inclusive
  const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
  const validDays = intervalDays.filter((day) => !isWeekend(day));
  const total = validDays.length;

  const percent = total === 0 ? 0 : Math.round((present / total) * 100);

  return {
    present,
    total,
    percent,
  };
};

// ----------

export const isMarked = async (subjectId: string) => {
  const db = await getDB();
  const id = `${subjectId}_${getTodayDateString()}`;
  return (await db.get("attendance", id)) != null;
};
