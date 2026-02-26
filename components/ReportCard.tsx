
import React, { useState, useMemo } from 'react';
import { Student, AttendanceStatus, NotificationLog } from '../types';
import { SUBJECTS } from '../constants';
import { generateReportComment } from '../services/geminiService';

interface ReportSettings {
  headOfSchool: string;
  signature: string;
  authPrefix: string;
}

interface ReportCardProps {
  students: Student[];
  schoolLogo: string;
  reportSettings: ReportSettings;
  onUpdateReportSettings: (settings: ReportSettings) => void;
  onLogNotification: (log: NotificationLog) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ students, schoolLogo, reportSettings, onUpdateReportSettings, onLogNotification }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiComments, setAiComments] = useState<Record<string, string>>({});
  const [isPrintAllMode, setIsPrintAllMode] = useState(false);

  const student = students.find(s => s.id === selectedStudentId);

  const handleGenerateComment = async (std: Student) => {
    setIsGeneratingAI(true);
    const filtered = std.grades.filter(g => g.term === selectedTerm);
    const comment = await generateReportComment({ ...std, grades: filtered });
    setAiComments(prev => ({ ...prev, [std.id]: comment }));
    setIsGeneratingAI(false);
  };

  /**
   * Triggers the browser print dialog with optimized PDF filename.
   */
  const handlePrintAction = () => {
    const originalTitle = document.title;
    
    // Set a professional filename for the "Save as PDF" destination
    if (isPrintAllMode) {
      document.title = `CCIS_TermReports_T${selectedTerm}_${new Date().getFullYear()}`;
    } else if (student) {
      const safeName = student.name.replace(/\s+/g, '_');
      document.title = `Report_${safeName}_Term${selectedTerm}_CCIS`;
    }

    window.print();

    // Revert title after dialog closure
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const handleEmailGuardian = () => {
    if (!student) return;
    setIsEmailing(true);
    setTimeout(() => {
      setIsEmailing(false);
      onLogNotification({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        recipientEmail: student.guardianEmail,
        studentName: student.name,
        subject: `Term ${selectedTerm} Report: ${student.name}`,
        type: 'ACADEMIC',
        status: 'SENT'
      });
      alert(`Terminal report for ${student.name} dispatched to ${student.guardianEmail}.`);
    }, 1200);
  };

  const renderReportContent = (std: Student) => {
    const grades = std.grades.filter(g => g.term === selectedTerm);
    const attendanceValues = Object.values(std.attendance);
    const presentCount = attendanceValues.filter(v => v === AttendanceStatus.PRESENT).length;
    const totalDays = attendanceValues.length || 1;
    const rate = Math.round((presentCount / totalDays) * 100);

    return (
      <div key={std.id} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 max-w-5xl mx-auto relative printable-report mb-8">
        {/* Header Section */}
        <div className="bg-gray-50/50 p-6 md:p-10 border-b border-gray-100 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 w-full">
              <div className="relative">
                <img src={std.avatar} className="w-24 h-24 md:w-28 md:h-28 rounded-3xl object-cover shadow-xl border-4 border-white" alt="" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white border-2 border-white shadow-lg no-print"><i className="fas fa-check text-xs"></i></div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight uppercase">{std.name}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest">{std.gradeLevel}</span>
                  <span className="px-3 py-1 bg-gray-800 text-white text-[10px] font-black uppercase rounded-full tracking-widest">TERM {selectedTerm}</span>
                </div>
                <p className="text-gray-400 text-[10px] mt-4 font-black uppercase tracking-widest">ID: <span className="text-gray-800">{std.id}</span> | GUARDIAN: <span className="text-gray-800">{std.guardianName}</span></p>
              </div>
            </div>
            <div className="lg:text-right flex flex-col items-center lg:items-end w-full lg:w-auto">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full p-1 border-2 border-orange-500 shadow-md">
                  <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="text-left lg:text-right">
                  <h3 className="text-lg md:text-xl font-black text-indigo-900 tracking-tighter uppercase leading-tight">CEDAR CREST</h3>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">International School</p>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Empowering Minds, Excellence in Growth</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
            <div className="lg:col-span-3 space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Academic Performance Index</h4>
              {grades.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[400px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">Subject</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase text-center">Score</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {grades.map((grade, idx) => {
                          const percent = (grade.score / grade.maxScore) * 100;
                          let gradeLetter = percent >= 90 ? 'A+' : percent >= 80 ? 'A' : percent >= 70 ? 'B' : percent >= 60 ? 'C' : 'F';
                          return (
                            <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4"><p className="font-bold text-black">{grade.subject}</p></td>
                              <td className="px-6 py-4 text-center font-black text-black">{grade.score}/100</td>
                              <td className="px-6 py-4 text-right"><span className="text-lg font-black text-indigo-600">{gradeLetter}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold text-sm">No recorded results for this term.</p>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-black text-emerald-700">{rate}%</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-widest">Attendance Rate</p>
                </div>
                <i className="fas fa-calendar-check text-3xl text-emerald-200"></i>
              </div>

              <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100" style={{ pageBreakInside: 'avoid' }}>
                <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3">Principal's Commentary</h4>
                <p className="text-sm text-indigo-900 leading-relaxed font-medium italic">
                  {aiComments[std.id] || "The student shows great potential and consistent effort in their studies. Continued focus on fundamental concepts will yield excellent results in the coming term."}
                </p>
              </div>

              {/* Signatures for Print */}
              <div className="pt-8 space-y-8 mt-auto" style={{ pageBreakInside: 'avoid' }}>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                  <div className="text-center">
                    <div className="h-10"></div>
                    <div className="w-40 border-b border-gray-400 mb-1"></div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Class Teacher</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-800 mb-1 font-serif italic">{reportSettings.headOfSchool}</p>
                    <div className="w-48 border-b border-gray-400 mb-1"></div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Head of Institute</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center flex justify-between items-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Generated Securely by CCIS Cloud</p>
          <p className="text-[9px] font-mono text-gray-500">{reportSettings.authPrefix}-{std.id}-{selectedTerm}-{new Date().getFullYear()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Control Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Academic Transcripts</h1>
          <p className="text-gray-500 mt-1 font-medium">Standardized terminal reports with institutional grading fidelity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="bg-white border-2 border-orange-200 text-orange-600 px-6 py-3 rounded-2xl font-bold hover:bg-orange-50 transition-all active:scale-95"
          >
            <i className="fas fa-cog mr-2"></i> Report Setup
          </button>
          
          <select 
            disabled={isPrintAllMode}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-white border-2 border-transparent hover:border-indigo-100 rounded-2xl px-5 py-3 shadow-sm font-bold text-black outline-none transition-all disabled:opacity-50"
          >
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsPrintAllMode(!isPrintAllMode)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95 ${isPrintAllMode ? 'bg-orange-600 text-white shadow-lg' : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <i className="fas fa-layer-group"></i> {isPrintAllMode ? 'Individual Mode' : 'Bulk Generation'}
            </button>
            <button 
              onClick={handlePrintAction} 
              className="bg-gray-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl flex items-center gap-2 active:scale-95"
            >
              <i className="fas fa-file-pdf"></i> {isPrintAllMode ? 'Export All PDFs' : 'Generate PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="glass-card p-8 rounded-[2rem] border border-orange-100 bg-orange-50/30 no-print animate-slideDown">
          <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-6">Institute Identity Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Head of School Name</label>
              <input 
                value={reportSettings.headOfSchool} 
                onChange={e => onUpdateReportSettings({...reportSettings, headOfSchool: e.target.value})}
                className="w-full bg-white border-none rounded-xl px-4 py-2 font-bold text-black shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Auth Prefix</label>
              <input 
                value={reportSettings.authPrefix} 
                onChange={e => onUpdateReportSettings({...reportSettings, authPrefix: e.target.value})}
                className="w-full bg-white border-none rounded-xl px-4 py-2 font-mono text-sm text-black shadow-sm"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
              >
                Save Branding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Side Controls */}
        {!isPrintAllMode && (
          <div className="xl:col-span-1 space-y-6 no-print">
            <div className="glass-card p-8 rounded-[2rem] shadow-sm border border-white">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Assessment Context</h3>
              <div className="space-y-8">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase mb-3 flex items-center gap-2">Active Term</label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-2xl">
                    {[1, 2, 3].map(t => (
                      <button key={t} onClick={() => setSelectedTerm(t)} className={`py-2 rounded-xl text-xs font-black transition-all ${selectedTerm === t ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>T{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => student && handleGenerateComment(student)}
                    disabled={isGeneratingAI}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingAI ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-wand-sparkles mr-2"></i>}
                    AI Analysis Comment
                  </button>
                </div>
                <button 
                  onClick={handleEmailGuardian} 
                  disabled={isEmailing}
                  className="w-full border-2 border-emerald-100 text-emerald-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all"
                >
                  <i className="fas fa-paper-plane mr-2"></i> Send to Guardian
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Display */}
        <div className={isPrintAllMode ? "xl:col-span-4" : "xl:col-span-3"}>
          {isPrintAllMode ? (
            <div className="space-y-12">
              {students.map(renderReportContent)}
            </div>
          ) : (
            student && renderReportContent(student)
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ReportCard;
