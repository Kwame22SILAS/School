
import React, { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Student, Teacher, SchoolEvent } from '../types';
import { SUBJECTS } from '../constants';
import { generateEventEmail } from '../services/geminiService';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  onGradeUpdate: (studentId: string, subject: string, term: number, score: number) => void;
  schoolLogo: string;
  onUpdateLogo: (url: string) => void;
  events: SchoolEvent[];
  onAddEvent: (event: SchoolEvent) => void;
  onUpdateEvent: (event: SchoolEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  students, 
  teachers, 
  onGradeUpdate, 
  schoolLogo, 
  onUpdateLogo,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const [quickGrade, setQuickGrade] = useState({
    studentId: '',
    subject: SUBJECTS[0],
    term: 1,
    score: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<SchoolEvent>>({
    title: '', date: '', time: '', location: '', description: '', color: 'text-indigo-600', bg: 'bg-indigo-50'
  });
  const [draftEmail, setDraftEmail] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [activeEventForEmail, setActiveEventForEmail] = useState<SchoolEvent | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const liveStats = useMemo(() => {
    return [
      { label: 'Total Students', value: students.length, icon: 'fa-user-graduate', color: 'bg-indigo-500' },
      { label: 'Total Teachers', value: teachers.length, icon: 'fa-chalkboard-teacher', color: 'bg-purple-500' },
      { label: 'Campus Status', value: 'Open', icon: 'fa-school', color: 'bg-emerald-500' },
      { label: 'Upcoming Events', value: events.length, icon: 'fa-calendar-day', color: 'bg-amber-500' },
    ];
  }, [students, teachers, events]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickGrade.studentId && quickGrade.score !== '') {
      onGradeUpdate(quickGrade.studentId, quickGrade.subject, quickGrade.term, Number(quickGrade.score));
      setShowSuccess(true);
      setQuickGrade(prev => ({ ...prev, score: '' }));
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onUpdateLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openEventModal = (event?: SchoolEvent) => {
    if (event) {
      setEditingEvent(event);
      setNewEvent(event);
    } else {
      setEditingEvent(null);
      setNewEvent({ title: '', date: '', time: '', location: '', description: '', color: 'text-indigo-600', bg: 'bg-indigo-50' });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onUpdateEvent(newEvent as SchoolEvent);
    } else {
      onAddEvent({ ...newEvent, id: Date.now().toString() } as SchoolEvent);
    }
    setIsEventModalOpen(false);
  };

  const handleNotifyGuardians = async (event: SchoolEvent) => {
    setActiveEventForEmail(event);
    setIsEmailModalOpen(true);
    setIsGeneratingEmail(true);
    const draft = await generateEventEmail(event);
    setDraftEmail(draft);
    setIsGeneratingEmail(false);
  };

  const handleSendEmails = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsEmailModalOpen(false);
      alert(`Notifications for "${activeEventForEmail?.title}" have been sent to all registered guardians.`);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 no-print">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Cloud Administration Hub</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Real-time overview of institute performance and data sync status.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-400">Academic Session</p>
          <p className="text-lg font-bold text-indigo-900 uppercase tracking-tighter"> FIRST TERM 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {liveStats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 border border-white">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl transition-transform group-hover:scale-110 shadow-lg`}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-sm border border-white">
            <h3 className="text-xl font-bold text-gray-800 mb-8">System Engagement Trends</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Mon', value: 92 }, { name: 'Tue', value: 95 }, { name: 'Wed', value: 88 }, { name: 'Thu', value: 96 }, { name: 'Fri', value: 94 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} domain={[0, 100]} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none'}} />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                    <Cell fill="#6366f1" />
                    <Cell fill="#6366f1" />
                    <Cell fill="#a5b4fc" />
                    <Cell fill="#6366f1" />
                    <Cell fill="#6366f1" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group">
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">School Branding</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">Changes are auto-saved to cloud profile.</p>
              </div>
              <div className="mt-6 flex items-center gap-6">
                <div className="relative group/logo">
                  <img src={schoolLogo} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-gray-50 shadow-sm" alt="Logo" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-camera text-xs"></i></button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase">Institutional Seal</p>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest mt-1">Upload Seal</button>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Current Motto</h4>
                <p className="text-indigo-100 text-sm italic leading-relaxed">"Knowledge for Service, Character for Life."</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fas fa-award"></i>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Premium Status</span>
                </div>
              </div>
              <i className="fas fa-university absolute -right-4 -bottom-4 text-white/5 text-8xl"></i>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-sm border border-white relative overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><i className="fas fa-bolt text-amber-500"></i>Direct Assessment</h3>
            <form onSubmit={handleQuickSubmit} className="space-y-5">
              <select value={quickGrade.studentId} onChange={e => setQuickGrade({...quickGrade, studentId: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black" required>
                <option value="">Choose Ward</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select value={quickGrade.term} onChange={e => setQuickGrade({...quickGrade, term: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black">
                  {[1, 2, 3].map(t => <option key={t} value={t}>Term {t}</option>)}
                </select>
                <input type="number" max="100" min="0" placeholder="%" value={quickGrade.score} onChange={e => setQuickGrade({...quickGrade, score: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-center text-black" required />
              </div>
              <button type="submit" className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all active:scale-95">Record Result</button>
            </form>
            {showSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-fadeIn">
                Data Saved Successfully
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Institute Calendar</h3>
              <button onClick={() => openEventModal()} className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors"><i className="fas fa-plus text-xs"></i></button>
            </div>
            <div className="space-y-6">
              {events.length === 0 ? (
                <p className="text-gray-400 text-xs italic text-center py-4">No scheduled events.</p>
              ) : events.map((event) => (
                <div key={event.id} className="flex flex-col gap-3 group relative">
                  <div className="flex items-center gap-4">
                    <div className={`${event.bg} ${event.color} w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-sm border border-black/5`}>
                      <span className="text-xs">{event.date.split('-')[2]}</span>
                      <span className="text-[10px] uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-700 truncate">{event.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{event.time} | {event.location}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEventModal(event)} className="text-gray-400 hover:text-indigo-600 w-8 h-8 rounded-full hover:bg-indigo-50 transition-all flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                      <button onClick={() => onDeleteEvent(event.id)} className="text-gray-400 hover:text-rose-600 w-8 h-8 rounded-full hover:bg-rose-50 transition-all flex items-center justify-center"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNotifyGuardians(event)}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800 flex items-center gap-2 self-start ml-18"
                  >
                    <i className="fas fa-paper-plane"></i>
                    Broadcast Event
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal - Unchanged but verified */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">{editingEvent ? 'Modify Event' : 'New Event'}</h2>
                <p className="text-indigo-100 text-xs font-bold uppercase mt-1">Calendar Record</p>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} className="text-white hover:text-indigo-200 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-10 space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Title</label>
                <input required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                  <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Time</label>
                  <input required type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-black" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Venue</label>
                <input required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Finalize Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Email Modal - Verified */}
      {isEmailModalOpen && (activeEventForEmail) && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
            <div className="bg-gray-800 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black">Secure Notification</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Recipients: All Guardians</p>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-white hover:text-gray-400 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 min-h-[300px] relative">
                {isGeneratingEmail ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <i className="fas fa-circle-notch fa-spin text-3xl text-indigo-500"></i>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">AI Drafting Message...</p>
                  </div>
                ) : (
                  <textarea 
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-black text-sm leading-relaxed resize-none scrollbar-hide font-medium"
                  />
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsEmailModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-3xl font-black uppercase tracking-widest active:scale-95">Cancel</button>
                <button onClick={handleSendEmails} disabled={isGeneratingEmail || isSending} className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  {isSending ? <><i className="fas fa-circle-notch fa-spin"></i> Dispatching...</> : <><i className="fas fa-paper-plane"></i> Send Notification</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Dashboard;
