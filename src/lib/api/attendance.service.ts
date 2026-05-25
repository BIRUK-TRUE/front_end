import { axiosInstance } from './axios';

export const attendanceService = {
  // Homeroom sections for the logged-in teacher
  async getMyHomeroomSections() {
    const { data } = await axiosInstance.get('/attendance/homeroom-sections/me');
    return data;
  },

  // Attendance sheet for a section on a date
  async getSectionSheet(sectionId: string, attendanceDate?: string) {
    const params = attendanceDate ? { attendance_date: attendanceDate } : {};
    const { data } = await axiosInstance.get(`/attendance/sections/${sectionId}/students`, { params });
    return data;
  },

  // Create a new attendance session
  async createSession(payload: { section_id: string; attendance_date: string; present_student_ids: string[]; remarks?: string }) {
    const { data } = await axiosInstance.post('/attendance/sessions', payload);
    return data;
  },

  // Update an existing session
  async updateSession(sessionId: string, payload: { present_student_ids?: string[]; remarks?: string }) {
    const { data } = await axiosInstance.patch(`/attendance/sessions/${sessionId}`, payload);
    return data;
  },

  // Get a single session
  async getSession(sessionId: string) {
    const { data } = await axiosInstance.get(`/attendance/sessions/${sessionId}`);
    return data;
  },

  // Delete a session
  async deleteSession(sessionId: string) {
    const { data } = await axiosInstance.delete(`/attendance/sessions/${sessionId}`);
    return data;
  },

  // List sessions for a section
  async getSectionSessions(sectionId: string, params: { page?: number; size?: number; start_date?: string; end_date?: string } = {}) {
    const { data } = await axiosInstance.get(`/attendance/sections/${sectionId}/sessions`, { params });
    return data;
  },

  // Daily summary
  async getDailySummary(sectionId: string, attendanceDate?: string) {
    const params = attendanceDate ? { attendance_date: attendanceDate } : {};
    const { data } = await axiosInstance.get(`/attendance/sections/${sectionId}/summary/daily`, { params });
    return data;
  },

  // Absent students list
  async getAbsentStudents(sectionId: string, attendanceDate?: string) {
    const params = attendanceDate ? { attendance_date: attendanceDate } : {};
    const { data } = await axiosInstance.get(`/attendance/sections/${sectionId}/absent`, { params });
    return data;
  },

  // Weekly trend
  async getWeeklyTrend(sectionId: string, weekStart?: string) {
    const params = weekStart ? { week_start: weekStart } : {};
    const { data } = await axiosInstance.get(`/attendance/sections/${sectionId}/summary/weekly`, { params });
    return data;
  },

  // Check if attendance taken
  async checkAttendanceTaken(sectionId: string, attendanceDate: string) {
    const { data } = await axiosInstance.get('/attendance/check', {
      params: { section_id: sectionId, attendance_date: attendanceDate },
    });
    return data;
  },

  // Bulk submit attendance (frontend-friendly format)
  async submitBulk(payload: {
    section_id: string;
    attendance_date: string;
    entries: { student_id: string; status: 'present' | 'absent'; note?: string }[];
    remarks?: string;
  }) {
    const { data } = await axiosInstance.post('/attendance/bulk', payload);
    return data;
  },

  // Student attendance records
  async getStudentAttendance(studentId: string, params: { page?: number; size?: number } = {}) {
    const { data } = await axiosInstance.get(`/attendance/student/${studentId}`, { params });
    return data;
  },

  // Student attendance stats
  async getStudentStats(studentId: string) {
    const { data } = await axiosInstance.get(`/attendance/student/${studentId}/stats`);
    return data;
  },
};
