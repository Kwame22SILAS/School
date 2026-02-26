
import { Student, Teacher, AttendanceStatus, CommunicationTemplate } from './types';

export const SUBJECTS = [
  'Mathematics', 
  'Science', 
  'English', 
  'History', 
  'Geography', 
  'Art',
  'COMPUTING',
  'LANGUAGE & LITERACY',
  'CREATIVE ARTS',
  'GHANAIAN LANG.',
  'WRITING',
  'RME',
  'CAREER TECHNOLOGY'
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'S001',
    name: 'Alex Johnson',
    gradeLevel: 'Grade 10',
    section: 'A',
    avatar: 'https://picsum.photos/seed/alex/100/100',
    guardianName: 'Mark Johnson',
    guardianEmail: 'johnson.parent@example.com',
    guardianPhone: '+1-555-0101',
    grades: [
      { subject: 'Mathematics', score: 88, maxScore: 100, term: 1 },
      { subject: 'Science', score: 92, maxScore: 100, term: 1 },
      { subject: 'English', score: 85, maxScore: 100, term: 1 },
    ],
    attendance: { '2023-10-01': AttendanceStatus.PRESENT, '2023-10-02': AttendanceStatus.PRESENT }
  },
  {
    id: 'S002',
    name: 'Sarah Williams',
    gradeLevel: 'Grade 10',
    section: 'B',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    guardianName: 'Linda Williams',
    guardianEmail: 'williams.parent@example.com',
    guardianPhone: '+1-555-0102',
    grades: [
      { subject: 'Mathematics', score: 75, maxScore: 100, term: 1 },
      { subject: 'English', score: 92, maxScore: 100, term: 1 },
    ],
    attendance: { '2023-10-01': AttendanceStatus.PRESENT, '2023-10-02': AttendanceStatus.ABSENT }
  }
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'T001',
    name: 'Dr. Robert Smith',
    department: 'Mathematics',
    email: 'robert.smith@edu.com',
    avatar: 'https://picsum.photos/seed/robert/100/100',
    attendance: { '2026-02-01': AttendanceStatus.PRESENT }
  }
];

export const DEFAULT_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'temp-1',
    name: 'General Announcement',
    subject: 'Important School Update - CCIS',
    category: 'GENERAL',
    content: 'Dear Parents/Guardians, we have a scheduled update regarding...'
  },
  {
    id: 'temp-2',
    name: 'Fee Notice',
    subject: 'Outstanding Balance Notification',
    category: 'FEE',
    content: 'Dear [GuardianName], this is a reminder regarding the outstanding fees for [StudentName]...'
  },
  {
    id: 'temp-3',
    name: 'Emergency Alert',
    subject: 'URGENT: School Closure Notice',
    category: 'EMERGENCY',
    content: 'Please be advised that Cedar Crest International School will be closed tomorrow due to...'
  }
];
