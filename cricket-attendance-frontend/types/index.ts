// TypeScript interfaces for the application

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Student {
  id: number;
  studentId: string;
  name: string;
  faculty: string;
  year: number;
  contactNumber?: string;
  createdAt?: string;
}

export interface PracticeSession {
  id: number;
  date: string;
  createdBy?: {
    id: number;
    email: string;
  };
  createdAt: string;
}

export interface StudentAttendanceRecord {
  studentId: number;
  studentRegId: string;
  studentName: string;
  isPresent: boolean;
}

export interface SessionAttendance {
  session: PracticeSession;
  attendance: StudentAttendanceRecord[];
}

export interface Attendance {
  id: number;
  practiceSessionId: number;
  studentId: number;
  isPresent: boolean;
}

export interface AttendanceRecord extends Attendance {
  student: Student;
}

export interface DashboardStats {
  totalPracticeDays: number;
  totalPlayers: number;
  averageAttendance: number;
  topAttendee: {
    name: string;
    attendancePercentage: number;
  };
}

export interface MonthlyAttendanceData {
  month: string;
  present: number;
  absent: number;
}

export interface StudentReport {
  student: Student;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
  attendanceHistory: {
    date: string;
    isPresent: boolean;
  }[];
}

export interface PracticeAttendance {
  id: number;
  date: string;
  presentStudentNames: string[];
}

export interface StudentStats {
  attendancePercentage: number;
  sessionsAttended: number;
  totalSessions: number;
  recentAttendance: {
    date: string;
    isPresent: boolean;
  }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  studentId: string;
  name: string;
  faculty: string;
  year: number;
  contactNumber?: string;
}
