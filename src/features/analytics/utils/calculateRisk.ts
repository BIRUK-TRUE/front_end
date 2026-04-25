import { RiskLevel, RiskFactor, StudentRisk } from '../types';
import { AcademicSettings, NotificationSettings } from '@/lib/api/settings.service';

interface StudentMetrics {
  student_id: string;
  student_name: string;
  registration_number: string;
  class_name: string;
  section_name: string;
  attendance_rate: number;
  grade_average: number;
  consecutive_absences: number;
  guardian_info?: {
    name: string;
    phone: string;
    id: string;
  };
}

export function calculateStudentRisk(
  student: StudentMetrics,
  academicThresholds: AcademicSettings,
  notificationThresholds: NotificationSettings
): StudentRisk {
  const factors: RiskFactor[] = [];
  let score = 0;

  // 1. Attendance Check
  const attWarning = academicThresholds.attendance_warning_threshold || 75;
  if (student.attendance_rate < attWarning) {
    const severity = student.attendance_rate < 50 ? 50 : student.attendance_rate < 65 ? 30 : 15;
    score += severity;
    factors.push({
      type: 'attendance',
      value: student.attendance_rate,
      threshold: attWarning,
      message: 'analytics.riskFactors.lowAttendance'
    });
  }

  // 2. Grade Check
  const passMark = academicThresholds.passing_mark || 50;
  if (student.grade_average < passMark) {
    const severity = student.grade_average < 30 ? 50 : student.grade_average < 45 ? 30 : 15;
    score += severity;
    factors.push({
      type: 'grade',
      value: student.grade_average,
      threshold: passMark,
      message: 'analytics.riskFactors.lowGrade'
    });
  }

  // 3. Consecutive Absence Check
  const consecutiveThreshold = notificationThresholds.consecutive_absence_threshold || 3;
  if (student.consecutive_absences >= consecutiveThreshold) {
    const severity = student.consecutive_absences >= 5 ? 60 : 40;
    score += severity;
    factors.push({
      type: 'consecutive_absence',
      value: student.consecutive_absences,
      threshold: consecutiveThreshold,
      message: 'analytics.riskFactors.consecutiveAbsence'
    });
  }

  // Determine Risk Level based on Cumulative Score and Critical Conditions
  let level: RiskLevel = 'low';

  // Manual overrides for critical conditions
  const isCritical = 
    student.attendance_rate < 50 || 
    student.grade_average < 30 || 
    student.consecutive_absences >= 5;

  const isHigh = 
    (student.attendance_rate >= 50 && student.attendance_rate < 65) ||
    (student.grade_average >= 30 && student.grade_average < 45) ||
    (student.consecutive_absences >= 3 && student.consecutive_absences < 5);

  const isMedium = 
    (student.attendance_rate >= 65 && student.attendance_rate < 75) ||
    (student.grade_average >= 45 && student.grade_average < 50);

  if (isCritical || score >= 80) {
    level = 'critical';
  } else if (isHigh || score >= 50) {
    level = 'high';
  } else if (isMedium || score >= 20) {
    level = 'medium';
  }

  return {
    studentId: student.student_id,
    studentName: student.student_name,
    registrationNumber: student.registration_number,
    className: student.class_name,
    sectionName: student.section_name,
    level,
    factors,
    score,
    attendanceRate: student.attendance_rate,
    gradeAverage: student.grade_average,
    consecutiveAbsences: student.consecutive_absences,
    guardianInfo: student.guardian_info
  };
}
