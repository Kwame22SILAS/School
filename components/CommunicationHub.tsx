
import React, { useState } from 'react';
import { Student, NotificationLog, CommunicationTemplate } from '../types';
import { sendSecureEmail } from '../services/emailService';

interface CommunicationHubProps {
  students: Student[];
  notificationLogs: NotificationLog[];
  onSendMessage: (log: NotificationLog) => void;
  templates: CommunicationTemplate[];
  onUpdateTemplates: (templates: CommunicationTemplate[]) => void;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({ 
  students, 
  notificationLogs, 
  onSendMessage,
  templates,
  onUpdateTemplates
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'templates' | 'compose'>('history');
  const [searchLog, setSearchLog] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [composeData, setComposeData] = useState({
    recipientType: 'all',
    individualId: '',
    subject: '',
    content: '',
    type: 'GENERAL' as NotificationLog['type']
  });

  const handleUseTemplate = (template: CommunicationTemplate) => {
    setComposeData({
      ...composeData,
      subject: template.subject,
      content: template.content,
      type: template.category
    });
    setActiveTab('compose');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const targetStudents: Student[] = [];
    if (composeData.recipientType === 'all') {
      targetStudents.push(...students);
    } else if (composeData.individualId) {
      const s = students.find(std => std.id === composeData.individualId);
      if (s) targetStudents.push(s);
    }

    for (const std of targetStudents) {
      const result = await sendSecureEmail(
        std.guardianEmail,
        composeData.subject.replace('[StudentName]', std.name),
        composeData.content.replace('[StudentName]', std.name),
        composeData.type
      );
      
      onSendMessage({
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        studentName: std.name,
      } as NotificationLog);
    }

    setIsSending(false);
    alert(`Transmission complete. Check audit logs for delivery verification.`);
    setActiveTab('history');
  };

  const filteredLogs = notificationLogs.filter(log => 
    log.studentName.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.recipientEmail.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Communication Hub</h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">Securely broadcast announcements and verify delivery status.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 w-full lg:w-auto overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('history')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-600'}`}>Audit Logs</button>
          <button onClick={() => setActiveTab('templates')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-600'}`}>Templates</button>
          <button onClick={() => setActiveTab('compose')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'compose' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-600'}`}>Compose</button>
        </div>
      </div>

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Filter audit logs..." 
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-black font-medium"
            />
          </div>

          <div className="glass-card rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Time (UTC)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Recipient</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic font-medium">No transmission logs found.</td></tr>
                  ) : filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-[10px] text-gray-400 font-mono">{log.timestamp.split('T')[1].substring(0,8)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{log.studentName}</p>
                        <p className="text-[10px] text-indigo-600 font-bold">{log.recipientEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
                          log.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'
                        }`}>{log.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 truncate max-w-xs">{log.subject}</td>
                      <td className="px-6 py-4 text-right">
                        {log.status === 'SENT' ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            <i className="fas fa-check-circle mr-1"></i> DELIVERED
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            <i className="fas fa-exclamation-triangle mr-1"></i> FAILED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(temp => (
            <div key={temp.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group border-t-4 border-t-indigo-500 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{temp.category}</p>
                <h3 className="font-bold text-gray-800 mb-4">{temp.name}</h3>
                <p className="text-xs text-gray-500 italic line-clamp-4 leading-relaxed font-medium mb-6">"{temp.content}"</p>
              </div>
              <button onClick={() => handleUseTemplate(temp)} className="w-full py-3 bg-gray-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Use Template</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'compose' && (
        <div className="max-w-3xl mx-auto glass-card rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white">
            <h2 className="text-xl font-black">Compose Outbound Message</h2>
            <p className="text-indigo-100 text-[10px] font-bold uppercase mt-1">Authorized Secure Relay Service</p>
          </div>
          <form onSubmit={handleSend} className="p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Recipients</label>
                <select 
                  value={composeData.recipientType}
                  onChange={e => setComposeData({...composeData, recipientType: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 text-black font-bold outline-none"
                >
                  <option value="all">Broadcast to All Guardians</option>
                  <option value="individual">Individual Ward Contact</option>
                </select>
              </div>
              {composeData.recipientType === 'individual' && (
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Select Student</label>
                  <select 
                    value={composeData.individualId}
                    onChange={e => setComposeData({...composeData, individualId: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 text-black font-bold outline-none"
                    required
                  >
                    <option value="">Choose ward...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Email Subject</label>
                <input 
                  type="text" 
                  value={composeData.subject}
                  onChange={e => setComposeData({...composeData, subject: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 text-black font-bold outline-none" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Message Body</label>
                <textarea 
                  value={composeData.content}
                  onChange={e => setComposeData({...composeData, content: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 text-black font-medium outline-none min-h-[200px] resize-none" 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSending}
              className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
            >
              {isSending ? <><i className="fas fa-sync fa-spin"></i> RELAYING...</> : <><i className="fas fa-paper-plane"></i> DISPATCH SECURELY</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub;
