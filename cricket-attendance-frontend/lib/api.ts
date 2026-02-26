import axios from 'axios';
import type {
    LoginRequest,
    LoginResponse,
    Student,
    PracticeSession,
    AttendanceRecord,
    DashboardStats,
    MonthlyAttendanceData,
    PracticeAttendance,
    StudentReport,
    StudentStats,
    RegisterRequest,
    SessionAttendance,
} from '@/types';

// API base URL - will be configured for backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication APIs
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<string> => {
        const response = await api.post<string>('/auth/register', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

// Student APIs
export const studentAPI = {
    getAll: async (): Promise<Student[]> => {
        const response = await api.get<Student[]>('/students');
        return response.data;
    },

    getById: async (id: number): Promise<Student> => {
        const response = await api.get<Student>(`/students/${id}`);
        return response.data;
    },

    create: async (student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
        const response = await api.post<Student>('/students', student);
        return response.data;
    },

    update: async (id: number, student: Partial<Student>): Promise<Student> => {
        const response = await api.put<Student>(`/students/${id}`, student);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/students/${id}`);
    },
};

// Attendance APIs
export const attendanceAPI = {
    createSession: async (date: string): Promise<PracticeSession> => {
        const response = await api.post<PracticeSession>('/attendance/session', { date });
        return response.data;
    },

    markAttendance: async (sessionId: number, attendance: { studentId: number; isPresent: boolean }[]): Promise<void> => {
        await api.post('/attendance/mark', { sessionId, attendance });
    },

    getSessionByDate: async (date: string): Promise<SessionAttendance> => {
        const response = await api.get<SessionAttendance>(`/attendance/session/${date}`);
        return response.data;
    },

    getHistory: async (filters?: { month?: string; studentId?: number }): Promise<AttendanceRecord[]> => {
        const response = await api.get('/attendance/history', { params: filters });
        return response.data;
    },

    getRecentAttendance: async (): Promise<PracticeAttendance[]> => {
        const response = await api.get<PracticeAttendance[]>('/attendance/recent');
        return response.data;
    },
};

// Report APIs
export const reportAPI = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/reports/dashboard');
        return response.data;
    },

    getMonthlyData: async (year: number, month: number): Promise<MonthlyAttendanceData[]> => {
        const response = await api.get<MonthlyAttendanceData[]>('/reports/monthly', {
            params: { year, month },
        });
        return response.data;
    },

    getStudentReport: async (studentId: number): Promise<StudentReport> => {
        const response = await api.get<StudentReport>(`/reports/student/${studentId}`);
        return response.data;
    },

    getPersonalStats: async (): Promise<StudentStats> => {
        const response = await api.get<StudentStats>('/reports/student');
        return response.data;
    },

    exportData: async (filters?: { month?: string; studentId?: number }) => {
        const response = await api.get('/reports/export', {
            params: filters,
            responseType: 'blob',
        });
        return response.data;
    },
};

export default api;
