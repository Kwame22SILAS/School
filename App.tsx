
import React, { useState, useCallback, useEffect } from 'react';
import { View, Student, Teacher, AttendanceStatus, SchoolEvent, NotificationLog, CommunicationTemplate } from './types';
import { MOCK_STUDENTS, MOCK_TEACHERS, DEFAULT_TEMPLATES } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ReportCard from './components/ReportCard';
import Grading from './components/Grading';
import TeacherList from './components/TeacherList';
import CommunicationHub from './components/CommunicationHub';
import GuardianPortal from './components/GuardianPortal';

const DEFAULT_LOGO = "";

const DEFAULT_EVENTS: SchoolEvent[] = [
  { id: '1', date: '2024-10-24', time: '09:00', title: 'Mid-Term Examinations', location: 'CCIS Hall', description: 'Mandatory exams for all grades.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: '2', date: '2024-11-02', time: '14:00', title: 'Parent-Teacher Meeting', location: 'Main Auditorium', description: 'Review student performance with faculty.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: '3', date: '2024-11-15', time: '10:00', title: 'Science Exhibition', location: 'Lab Block B', description: 'Showcasing student scientific projects.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [schoolLogo, setSchoolLogo] = useState<string>(() => {
    return localStorage.getItem('cc_school_logo') || DEFAULT_LOGO;
  });

  const [reportSettings, setReportSettings] = useState(() => {
    const saved = localStorage.getItem('cc_report_settings');
    return saved ? JSON.parse(saved) : {
      headOfSchool: 'S. Thompson',
      signature: '',
      authPrefix: 'ES-2024-TR'
    };
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('cc_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('cc_teachers');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    const saved = localStorage.getItem('cc_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('cc_notif_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<CommunicationTemplate[]>(() => {
    const saved = localStorage.getItem('cc_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  // Global Persistence Engine
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('cc_students', JSON.stringify(students));
    localStorage.setItem('cc_teachers', JSON.stringify(teachers));
    localStorage.setItem('cc_events', JSON.stringify(events));
    localStorage.setItem('cc_notif_logs', JSON.stringify(notificationLogs));
    localStorage.setItem('cc_templates', JSON.stringify(templates));
    localStorage.setItem('cc_school_logo', schoolLogo);
    localStorage.setItem('cc_report_settings', JSON.stringify(reportSettings));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [students, teachers, events, notificationLogs, templates, schoolLogo, reportSettings]);

  const handleAddStudent = useCallback((newStudent: Student) => setStudents(prev => [newStudent, ...prev]), []);
  const handleDeleteStudent = useCallback((id: string) => setStudents(prev => prev.filter(s => s.id !== id)), []);
  const handleBulkDeleteStudents = useCallback((ids: string[]) => setStudents(prev => prev.filter(s => !ids.includes(s.id))), []);

  const handleAddTeacher = useCallback((newTeacher: Teacher) => setTeachers(prev => [newTeacher, ...prev]), []);
  const handleUpdateTeacher = useCallback((updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  }, []);
  const handleDeleteTeacher = useCallback((id: string) => setTeachers(prev => prev.filter(t => t.id !== id)), []);
  const handleBulkDeleteTeachers = useCallback((ids: string[]) => setTeachers(prev => prev.filter(t => !ids.includes(t.id))), []);

  const handleAttendanceChange = useCallback((studentId: string, status: AttendanceStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: { ...s.attendance, [today]: status } } : s));
  }, []);

  const handleBulkAttendanceChange = useCallback((studentIds: string[], status: AttendanceStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => studentIds.includes(s.id) ? { ...s, attendance: { ...s.attendance, [today]: status } } : s));
  }, []);

  const handleGradeUpdate = useCallback((studentId: string, subject: string, term: number, score: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const existingGradeIdx = s.grades.findIndex(g => g.subject === subject && g.term === term);
        const newGrades = [...s.grades];
        if (existingGradeIdx > -1) newGrades[existingGradeIdx] = { ...newGrades[existingGradeIdx], score };
        else newGrades.push({ subject, score, maxScore: 100, term });
        return { ...s, grades: newGrades };
      }
      return s;
    }));
  }, []);

  const handleAddEvent = useCallback((event: SchoolEvent) => setEvents(prev => [...prev, event]), []);
  const handleUpdateEvent = useCallback((updatedEvent: SchoolEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }, []);
  const handleDeleteEvent = useCallback((id: string) => setEvents(prev => prev.filter(e => e.id !== id)), []);

  const handleLogNotification = useCallback((log: NotificationLog) => {
    setNotificationLogs(prev => [log, ...prev]);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] relative">
      {isAdminMode && (
        <>
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[180] lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          <Sidebar 
            currentView={currentView} 
            setView={(view) => {
              setCurrentView(view);
              setIsSidebarOpen(false);
            }} 
            schoolLogo={schoolLogo} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </>
      )}
      
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto max-h-screen scrollbar-hide flex flex-col ${!isAdminMode ? 'max-w-7xl mx-auto' : ''}`}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 no-print">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {isAdminMode && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-3 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600 active:scale-95 transition-all"
              >
                <i className="fas fa-bars text-lg"></i>
              </button>
            )}
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-md active:scale-95 ${isAdminMode ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
            >
              <i className={`fas ${isAdminMode ? 'fa-user-shield' : 'fa-home'} mr-2`}></i>
              {isAdminMode ? 'Guardian View' : 'Admin Portal'}
            </button>
          </div>
          
          <div className="flex items-center gap-6 self-end sm:self-auto">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-indigo-100 shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {isSaving ? 'Cloud Syncing...' : 'System Online'}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {(!isAdminMode) ? (
            <GuardianPortal ward={students.find(s => s.id === 'S001') || students[0]} schoolLogo={schoolLogo} />
          ) : (
            <>
              {currentView === 'dashboard' && <Dashboard students={students} teachers={teachers} onGradeUpdate={handleGradeUpdate} schoolLogo={schoolLogo} onUpdateLogo={setSchoolLogo} events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} />}
              {currentView === 'students' && <StudentList students={students} onAttendanceChange={handleAttendanceChange} onBulkAttendanceChange={handleBulkAttendanceChange} onAddStudent={handleAddStudent} onDeleteStudent={handleDeleteStudent} onBulkDeleteStudents={handleBulkDeleteStudents} />}
              {currentView === 'teachers' && <TeacherList teachers={teachers} onAttendanceChange={() => {}} onBulkAttendanceChange={() => {}} onAddTeacher={handleAddTeacher} onUpdateTeacher={handleUpdateTeacher} onDeleteTeacher={handleDeleteTeacher} onBulkDeleteTeachers={handleBulkDeleteTeachers} />}
              {currentView === 'grading' && <Grading students={students} onGradeUpdate={handleGradeUpdate} onLogNotification={handleLogNotification} />}
              {currentView === 'reports' && <ReportCard students={students} schoolLogo={schoolLogo} reportSettings={reportSettings} onUpdateReportSettings={setReportSettings} onLogNotification={handleLogNotification} />}
              {currentView === 'notifications' && (
                <CommunicationHub 
                  students={students} 
                  notificationLogs={notificationLogs} 
                  onSendMessage={handleLogNotification}
                  templates={templates}
                  onUpdateTemplates={setTemplates}
                />
              )}
            </>
          )}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 pb-4 no-print text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400">
            <p className="text-[10px] font-black uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Cedar Crest International School. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-colors">Security Audit</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">v2.5.0-LTS</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
