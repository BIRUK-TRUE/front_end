import { NotificationType, NotificationPriority } from '../types';

export interface NotificationTemplate {
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  variables: string[];
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    name: 'Absence Alert',
    type: NotificationType.ATTENDANCE_ALERT,
    title: 'Student Absence Notice',
    message: 'Dear Guardian, your child {student_name} was absent from school on {date}. Please contact the school if this was not planned.',
    priority: NotificationPriority.HIGH,
    variables: ['student_name', 'date'],
  },
  {
    name: 'Fee Reminder',
    type: NotificationType.FEE_REMINDER,
    title: 'Fee Payment Reminder',
    message: 'Dear Guardian, school fees for {student_name} are due on {due_date}. Amount: {amount} ETB. Please make payment to avoid penalties.',
    priority: NotificationPriority.MEDIUM,
    variables: ['student_name', 'due_date', 'amount'],
  },
  {
    name: 'Low Grade Alert',
    type: NotificationType.GRADE_ALERT,
    title: 'Academic Performance Alert',
    message: 'Dear Guardian, {student_name} has received a grade of {grade} in {subject}. Please encourage them to improve their performance.',
    priority: NotificationPriority.HIGH,
    variables: ['student_name', 'grade', 'subject'],
  },
  {
    name: 'Low Attendance Alert',
    type: NotificationType.ATTENDANCE_ALERT,
    title: 'Attendance Warning',
    message: 'Dear Guardian, {student_name}\'s attendance rate is {percentage}%. Please ensure regular attendance for better academic performance.',
    priority: NotificationPriority.HIGH,
    variables: ['student_name', 'percentage'],
  },
  {
    name: 'Schedule Change',
    type: NotificationType.SCHEDULE,
    title: 'Class Schedule Updated',
    message: 'Dear Student, the schedule for {subject} on {day} has been changed. New time: {new_time}. Please check your updated timetable.',
    priority: NotificationPriority.MEDIUM,
    variables: ['subject', 'day', 'new_time'],
  },
  {
    name: 'General Announcement',
    type: NotificationType.ANNOUNCEMENT,
    title: 'School Announcement',
    message: '{message_content}. Please contact the administration for more information.',
    priority: NotificationPriority.MEDIUM,
    variables: ['message_content'],
  },
  {
    name: 'Emergency Alert',
    type: NotificationType.SYSTEM,
    title: 'Emergency Notification',
    message: '{emergency_message}. Please follow the instructions provided by school authorities.',
    priority: NotificationPriority.URGENT,
    variables: ['emergency_message'],
  },
  {
    name: 'Exam Schedule',
    type: NotificationType.ANNOUNCEMENT,
    title: 'Exam Schedule Published',
    message: 'The exam schedule for {term} has been published. Exams will begin on {start_date}. Please prepare accordingly.',
    priority: NotificationPriority.MEDIUM,
    variables: ['term', 'start_date'],
  },
  {
    name: 'Parent Meeting',
    type: NotificationType.ANNOUNCEMENT,
    title: 'Parent-Teacher Meeting',
    message: 'A parent-teacher meeting is scheduled for {date} at {time}. Your attendance is important for your child\'s progress.',
    priority: NotificationPriority.MEDIUM,
    variables: ['date', 'time'],
  },
  {
    name: 'Holiday Notice',
    type: NotificationType.ANNOUNCEMENT,
    title: 'School Holiday',
    message: 'The school will be closed from {start_date} to {end_date} for {holiday_name}. Classes will resume on {resume_date}.',
    priority: NotificationPriority.LOW,
    variables: ['start_date', 'end_date', 'holiday_name', 'resume_date'],
  },
];
