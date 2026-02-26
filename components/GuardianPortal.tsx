
import React from 'react';
import { Student } from '../types';
import ReportCard from './ReportCard';

interface GuardianPortalProps {
  ward: Student;
  schoolLogo: string;
}

const GuardianPortal: React.FC<GuardianPortalProps> = ({ ward, schoolLogo }) => {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-indigo-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-800">Secure Guardian Portal</h1>
            <p className="text-gray-500 font-medium text-sm md:text-base">Viewing academic records for: <span className="text-indigo-600 font-bold">{ward.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-widest">Authorized Access Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Grade</p>
          <p className="text-2xl font-black text-gray-800">{ward.gradeLevel}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Student ID</p>
          <p className="text-2xl font-black text-indigo-600 font-mono">{ward.id}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Section</p>
          <p className="text-2xl font-black text-gray-800">Room {ward.section}</p>
        </div>
      </div>

      <ReportCard 
        students={[ward]} 
        schoolLogo={schoolLogo}
        reportSettings={{ headOfSchool: 'Portal View', signature: '', authPrefix: 'VERIFIED' }}
        onUpdateReportSettings={() => {}}
        onLogNotification={() => {}}
      />
      
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
        <i className="fas fa-info-circle text-amber-500 mt-1"></i>
        <div>
          <p className="text-sm font-bold text-amber-800">Privacy Notice</p>
          <p className="text-xs text-amber-700 leading-relaxed">As a guardian, you only have access to information directly related to your ward. Academic reports and attendance logs are encrypted and served through a secure session.</p>
        </div>
      </div>
    </div>
  );
};

export default GuardianPortal;
