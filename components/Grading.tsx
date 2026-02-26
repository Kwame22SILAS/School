
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Grade, NotificationLog } from '../types';
import { SUBJECTS } from '../constants';

interface GradingProps {
  students: Student[];
  onGradeUpdate: (studentId: string, subject: string, term: number, score: number) => void;
  onLogNotification: (log: NotificationLog) => void;
}

interface PerformanceAlert {
  id: string;
  studentName: string;
  score: number;
  subject: string;
  studentId: string;
}

const Grading: React.FC<GradingProps> = ({ students, onGradeUpdate, onLogNotification }) => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [localScores, setLocalScores] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  const THRESHOLD = 60;

  const studentGrades = useMemo(() => {
    return students.map(student => {
      const grade = student.grades.find(g => g.subject === selectedSubject && g.term === selectedTerm);
      return {
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        gradeLevel: student.gradeLevel,
        currentScore: grade?.score ?? 0,
        maxScore: grade?.maxScore ?? 100
      };
    });
  }, [students, selectedSubject, selectedTerm]);

  const handleScoreChange = (studentId: string, val: string) => {
    if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
      setLocalScores(prev => ({ ...prev, [studentId]: val }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newAlerts: PerformanceAlert[] = [];
    
    Object.entries(localScores).forEach(([studentId, scoreStr]) => {
      const score = Number(scoreStr);
      if (scoreStr !== '' && score < THRESHOLD) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          newAlerts.push({
            id: `${studentId}-${Date.now()}`,
            studentName: student.name,
            score: score,
            subject: selectedSubject,
            studentId: studentId
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    
    Object.entries(localScores).forEach(([studentId, score]) => {
      if (score !== '') {
        onGradeUpdate(studentId, selectedSubject, selectedTerm, Number(score));
      }
    });
    
    setLocalScores({});
    setIsSaving(false);
  };

  const notifyGuardianOfLowGrade = (perfAlert: PerformanceAlert) => {
    const student = students.find(s => s.id === perfAlert.studentId);
    if (student) {
      const logEntry: NotificationLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        recipientEmail: student.guardianEmail,
        studentName: student.name,
        subject: `Performance Alert: ${perfAlert.subject}`,
        type: 'ACADEMIC',
        status: 'SENT'
      };
      onLogNotification(logEntry);
      window.alert(`Academic Alert dispatched to guardian: ${student.guardianEmail}. Record saved in Audit Logs.`);
      setAlerts(prev => prev.filter(a => a.id !== perfAlert.id));
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    if (score >= THRESHOLD) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 85) return 'fa-star';
    if (score >= 70) return 'fa-medal';
    if (score >= THRESHOLD) return 'fa-award';
    return 'fa-exclamation-triangle';
  };

  const getStatusText = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= THRESHOLD) return 'Passing';
    return 'Academic Alert';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Grading Management</h1>
          <p className="text-gray-500 font-medium">Capture assessments and trigger automatic performance alerts.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide max-w-full">
            {[1, 2, 3].map(term => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedTerm === term ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Term {term}
              </button>
            ))}
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 md:flex-none bg-white border-none rounded-2xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black"
          >
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-bell animate-swing"></i>
              Active Academic Alerts
            </h3>
            <button onClick={() => setAlerts([])} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider">Dismiss All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between group animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs">
                    <i className="fas fa-exclamation"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{alert.studentName}</p>
                    <p className="text-[10px] text-rose-600 font-black uppercase tracking-tighter">{alert.score}% in {alert.subject}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => notifyGuardianOfLowGrade(alert)}
                    className="w-8 h-8 rounded-lg bg-rose-200 text-rose-700 hover:bg-rose-300 transition-colors flex items-center justify-center"
                    title="Notify Guardian"
                  >
                    <i className="fas fa-paper-plane text-[10px]"></i>
                  </button>
                  <button 
                    onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    className="text-gray-300 hover:text-rose-500 transition-colors"
                  >
                    <i className="fas fa-times text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase text-center tracking-widest">Recorded Score</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase text-center w-64 tracking-widest">Entry Field</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-600 uppercase text-right tracking-widest">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {studentGrades.map((item) => {
              const currentVal = localScores[item.id] !== undefined ? localScores[item.id] : '';
              const displayScore = currentVal !== '' ? Number(currentVal) : item.currentScore;
              const statusColor = getStatusColor(displayScore);
              const isFailing = displayScore < THRESHOLD;
              
              return (
                <tr key={item.id} className={`transition-colors group ${isFailing ? 'bg-rose-50/20' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img src={item.avatar} className={`w-12 h-12 rounded-2xl object-cover border-2 transition-all ${isFailing ? 'border-rose-300' : 'border-transparent'}`} alt="" />
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.gradeLevel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-black text-[10px] ${item.currentScore < THRESHOLD ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                      {item.currentScore} / 100
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(item.id, e.target.value)}
                        className={`w-20 text-center py-2 bg-gray-50 border-2 rounded-xl outline-none font-black text-black transition-all ${
                          currentVal !== '' && Number(currentVal) < THRESHOLD 
                            ? 'border-rose-400 text-rose-600 focus:bg-rose-50' 
                            : 'border-transparent focus:border-indigo-500 focus:bg-white'
                        }`}
                        placeholder={item.currentScore.toString()}
                      />
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${statusColor}`}
                          style={{ width: `${displayScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center gap-2 text-xs font-black px-3 py-1 rounded-full ${statusColor.replace('bg-', 'text-').replace('500', '600')} ${statusColor.replace('bg-', 'bg-')}/10`}>
                        <i className={`fas ${getStatusIcon(displayScore)} text-[10px]`}></i>
                        {getStatusText(displayScore)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || Object.keys(localScores).length === 0}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95"
          >
            {isSaving ? <><i className="fas fa-sync fa-spin"></i> SAVING RECORD...</> : <><i className="fas fa-check-double"></i> COMMIT CHANGES</>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s infinite ease-in-out;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};

export default Grading;
