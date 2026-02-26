
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export interface Grade {
  subject: string;
  score: number;
  maxScore: number;
  term: number;
}

export interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  avatar: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  grades: Grade[];
  attendance: Record<string, AttendanceStatus>;
}

export interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
  avatar: string;
  attendance: Record<string, AttendanceStatus>;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  color: string;
  bg: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  studentName: string;
  subject: string;
  type: 'ACADEMIC' | 'EVENT' | 'EMERGENCY' | 'FEE' | 'GENERAL';
  status: 'SENT' | 'FAILED' | 'QUEUED';
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'ACADEMIC' | 'EVENT' | 'EMERGENCY' | 'FEE' | 'GENERAL';
}

export type View = 'dashboard' | 'students' | 'teachers' | 'grading' | 'reports' | 'notifications' | 'guardian_portal';
