
import React, { useState, useMemo, useRef } from 'react';
import { Student, AttendanceStatus } from '../types';

interface StudentListProps {
  students: Student[];
  onAttendanceChange: (studentId: string, status: AttendanceStatus) => void;
  onBulkAttendanceChange: (studentIds: string[], status: AttendanceStatus) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onBulkDeleteStudents: (ids: string[]) => void;
}

const StudentList: React.FC<StudentListProps> = ({ 
  students, 
  onAttendanceChange, 
  onBulkAttendanceChange, 
  onAddStudent, 
  onDeleteStudent,
  onBulkDeleteStudents 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State for the new Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    targets: Student[];
  }>({ isOpen: false, targets: [] });

  const [newStudent, setNewStudent] = useState({
    name: '',
    id: '',
    gradeLevel: 'Grade 10',
    section: 'A',
    avatar: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleOpenSingleDelete = (student: Student) => {
    setDeleteConfirmation({ isOpen: true, targets: [student] });
  };

  const handleOpenBulkDelete = () => {
    const selectedStudents = students.filter(s => selectedIds.has(s.id));
    setDeleteConfirmation({ isOpen: true, targets: selectedStudents });
  };

  const confirmDeletion = () => {
    const ids = deleteConfirmation.targets.map(t => t.id);
    if (ids.length === 1) {
      onDeleteStudent(ids[0]);
    } else {
      onBulkDeleteStudents(ids);
    }
    setDeleteConfirmation({ isOpen: false, targets: [] });
    setSelectedIds(new Set());
  };

  const handleBulkAttendanceUpdate = (status: AttendanceStatus) => {
    onBulkAttendanceChange(Array.from(selectedIds), status);
    setSelectedIds(new Set());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewStudent(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      ...newStudent,
      grades: [],
      attendance: {},
      avatar: newStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudent.name)}&background=random`
    });
    setIsAddModalOpen(false);
    setNewStudent({ name: '', id: '', gradeLevel: 'Grade 10', section: 'A', avatar: '', guardianName: '', guardianEmail: '', guardianPhone: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-32 no-print">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Student Directory</h1>
          <p className="text-gray-500 font-medium">Manage enrollment and verify guardian contact credentials.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <i className="fas fa-plus mr-2"></i> Register Student
        </button>
      </div>

      <div className="relative group max-w-md">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
        <input 
          type="text" 
          placeholder="Search students by name or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black font-bold"
        />
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-sm relative border border-white">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 w-12">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ward Profile</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Placement</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Daily Attendance</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/40">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">No students found matching current filter criteria.</td>
              </tr>
            ) : filteredStudents.map((student) => {
              const currentStatus = student.attendance[today] || null;
              const isSelected = selectedIds.has(student.id);
              return (
                <tr key={student.id} className={`transition-colors group ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-6 py-5">
                    <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={isSelected} onChange={() => toggleOne(student.id)} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img src={student.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-white" alt="" />
                      <div>
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">{student.gradeLevel} • {student.section}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => onAttendanceChange(student.id, AttendanceStatus.PRESENT)} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${currentStatus === AttendanceStatus.PRESENT ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-gray-50 text-gray-300 hover:bg-emerald-50 hover:text-emerald-500'}`}
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        onClick={() => onAttendanceChange(student.id, AttendanceStatus.ABSENT)} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${currentStatus === AttendanceStatus.ABSENT ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-gray-50 text-gray-300 hover:bg-rose-50 hover:text-rose-500'}`}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenSingleDelete(student)} 
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

      {/* Bulk Action Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 md:bottom-10 left-4 right-4 md:left-1/2 md:-translate-x-1/2 bg-gray-900/95 backdrop-blur-md text-white px-6 md:px-8 py-4 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-8 border border-white/10 z-[150] animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black">{selectedIds.size}</div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Selected Wards</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-white/10"></div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <button onClick={() => handleBulkAttendanceUpdate(AttendanceStatus.PRESENT)} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">Mark Present</button>
            <button onClick={() => handleBulkAttendanceUpdate(AttendanceStatus.ABSENT)} className="text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors">Mark Absent</button>
            <button onClick={handleOpenBulkDelete} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors">Delete Selected</button>
          </div>
          <div className="hidden md:block w-px h-6 bg-white/10"></div>
          <button onClick={() => setSelectedIds(new Set())} className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors">Deselect All</button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp border border-white">
            <div className="bg-rose-500 p-10 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Data Removal Warning</h2>
              <p className="text-rose-100 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Irreversible System Action</p>
            </div>
            <div className="p-10 space-y-6">
              <p className="text-sm font-medium text-gray-600 text-center leading-relaxed">
                You are about to permanently delete <span className="text-gray-900 font-black">{deleteConfirmation.targets.length}</span> records from the central student database.
              </p>
              
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 max-h-48 overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                  {deleteConfirmation.targets.map(t => (
                    <div key={t.id} className="flex items-center gap-4">
                      <img src={t.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                      <div>
                        <p className="text-xs font-black text-gray-800">{t.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setDeleteConfirmation({ isOpen: false, targets: [] })}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                >
                  Keep Records
                </button>
                <button 
                  onClick={confirmDeletion}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Register Student</h2>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Enrollment Record</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden group">
                  {newStudent.avatar ? <img src={newStudent.avatar} className="w-full h-full object-cover" alt="Preview" /> : <div className="text-center group-hover:scale-110 transition-transform"><i className="fas fa-camera text-gray-300 text-xl"></i><p className="text-[8px] font-black text-gray-400 uppercase mt-1">Photo</p></div>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="col-span-2 border-b border-gray-100 pb-2">
                  <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Student Details</h3>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black" placeholder="Student Name" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Student ID</label>
                  <input required value={newStudent.id} onChange={e => setNewStudent({...newStudent, id: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-black" placeholder="S2024-001" />
                </div>
                
                <div className="col-span-2 border-b border-gray-100 pb-2 mt-4">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Guardian Outreach Credentials</h3>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Guardian Name</label>
                  <input required value={newStudent.guardianName} onChange={e => setNewStudent({...newStudent, guardianName: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-black" placeholder="Name" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Guardian Phone</label>
                  <input required value={newStudent.guardianPhone} onChange={e => setNewStudent({...newStudent, guardianPhone: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-black" placeholder="(233) 0540 000 000" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Guardian Secure Email</label>
                  <input required type="email" value={newStudent.guardianEmail} onChange={e => setNewStudent({...newStudent, guardianEmail: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-black" placeholder="guardian@school-portal.com" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4">Finalize Enrollment</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentList;
