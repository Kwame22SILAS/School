
import React, { useState, useMemo, useRef } from 'react';
import { Teacher, AttendanceStatus } from '../types';

interface TeacherListProps {
  teachers: Teacher[];
  onAttendanceChange: (teacherId: string, status: AttendanceStatus) => void;
  onBulkAttendanceChange: (teacherIds: string[], status: AttendanceStatus) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onBulkDeleteTeachers: (ids: string[]) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ 
  teachers, 
  onAttendanceChange, 
  onBulkAttendanceChange, 
  onAddTeacher, 
  onUpdateTeacher,
  onDeleteTeacher,
  onBulkDeleteTeachers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  
  // Deletion Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; targets: Teacher[] }>({
    isOpen: false,
    targets: []
  });

  const [formData, setFormData] = useState({
    name: '',
    id: '',
    department: 'Mathematics',
    email: '',
    avatar: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleOpenDeleteConfirm = (teacher: Teacher) => {
    setDeleteConfirmation({ isOpen: true, targets: [teacher] });
  };

  const handleOpenBulkDeleteConfirm = () => {
    const selected = teachers.filter(t => selectedIds.has(t.id));
    setDeleteConfirmation({ isOpen: true, targets: selected });
  };

  const confirmDelete = () => {
    const ids = deleteConfirmation.targets.map(t => t.id);
    if (ids.length === 1) onDeleteTeacher(ids[0]);
    else onBulkDeleteTeachers(ids);
    setDeleteConfirmation({ isOpen: false, targets: [] });
    setSelectedIds(new Set());
  };

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setFormData({ name: teacher.name, id: teacher.id, department: teacher.department, email: teacher.email, avatar: teacher.avatar });
    } else {
      setEditingTeacherId(null);
      setFormData({ name: '', id: '', department: 'Mathematics', email: '', avatar: '' });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      attendance: editingTeacherId ? (teachers.find(t => t.id === editingTeacherId)?.attendance || {}) : {},
      avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
    };
    if (editingTeacherId) onUpdateTeacher(payload as Teacher);
    else onAddTeacher(payload as Teacher);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Faculty Management</h1>
          <p className="text-gray-500 font-medium">Official directory of teaching and administrative staff.</p>
        </div>
        <button onClick={() => openModal()} className="bg-purple-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all">
          Register Staff
        </button>
      </div>

      <div className="relative max-w-md">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input type="text" placeholder="Filter faculty..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-purple-500 outline-none text-black font-bold" />
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-sm border border-white">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 w-12">
                <input type="checkbox" className="w-5 h-5 rounded-md text-purple-600" checked={selectedIds.size > 0 && selectedIds.size === filteredTeachers.length} onChange={() => setSelectedIds(selectedIds.size === filteredTeachers.length ? new Set() : new Set(filteredTeachers.map(t => t.id)))} />
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Faculty Member</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Department</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTeachers.map(teacher => (
              <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5"><input type="checkbox" className="w-5 h-5 rounded-md text-purple-600" checked={selectedIds.has(teacher.id)} onChange={() => toggleOne(teacher.id)} /></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img src={teacher.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                    <div><p className="font-bold text-gray-800">{teacher.name}</p><p className="text-[10px] text-gray-400 font-black uppercase">{teacher.id}</p></div>
                  </div>
                </td>
                <td className="px-6 py-5"><span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-widest">{teacher.department}</span></td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(teacher)} className="w-9 h-9 rounded-xl bg-gray-50 text-indigo-600 hover:bg-white flex items-center justify-center"><i className="fas fa-edit text-xs"></i></button>
                    <button onClick={() => handleOpenDeleteConfirm(teacher)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"><i className="fas fa-trash-alt text-xs"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 md:bottom-10 left-4 right-4 md:left-1/2 md:-translate-x-1/2 bg-gray-900 text-white px-6 md:px-8 py-4 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-slideUp z-50">
          <span className="text-xs font-black uppercase tracking-widest">{selectedIds.size} Members Selected</span>
          <div className="flex gap-6">
            <button onClick={handleOpenBulkDeleteConfirm} className="text-xs font-black uppercase tracking-widest text-rose-500">Delete Records</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs font-bold text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="bg-rose-500 p-10 text-white text-center">
              <i className="fas fa-user-slash text-4xl mb-4"></i>
              <h2 className="text-2xl font-black">Verify Staff Removal</h2>
              <p className="text-rose-100 text-[10px] font-bold uppercase mt-2 tracking-widest">Permanent Data Erasure</p>
            </div>
            <div className="p-10 space-y-6">
              <p className="text-sm font-medium text-gray-600 text-center">Deleting <span className="text-gray-900 font-black">{deleteConfirmation.targets.length}</span> staff members. This cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirmation({ isOpen: false, targets: [] })} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px]">Keep Staff</button>
                <button onClick={confirmDelete} className="flex-1 bg-rose-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100">Confirm Deletion</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-purple-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="bg-purple-600 p-8 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black">{editingTeacherId ? 'Edit Profile' : 'New Faculty'}</h2>
              <button onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-bold text-black" placeholder="Full Name" />
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-bold text-black" placeholder="Official Email" />
              <input required disabled={!!editingTeacherId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-mono text-sm text-black" placeholder="Staff ID (FAC-xxx)" />
              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl">Finalize Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherList;
