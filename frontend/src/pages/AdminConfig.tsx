import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Settings,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

interface AuditLogEntry {
  _id: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
  action: string;
  details: string;
  ip?: string;
  createdAt: string;
}

const AdminConfig: React.FC = () => {
  // Threshold States
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [gpaThresholds, setGpaThresholds] = useState({
    critical: 5.0,
    high: 6.0,
    moderate: 7.0,
  });
  const [weights, setWeights] = useState({
    marks: 0.30,
    attendance: 0.20,
    assignment: 0.15,
    cgpa: 0.20,
    credits: 0.15,
  });

  // Audit Logs States
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalCount, setLogsTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchConfigsAndLogs = async () => {
    try {
      setLoading(true);

      // Fetch configs
      const configRes = await API.get('/admin/config');
      if (configRes.data.success) {
        configRes.data.data.forEach((c: any) => {
          if (c.key === 'attendanceThreshold') setAttendanceThreshold(c.value);
          if (c.key === 'gpaThresholds') setGpaThresholds(c.value);
          if (c.key === 'weights') setWeights(c.value);
        });
      }

      // Fetch logs
      const logsRes = await API.get(`/audit-logs?page=${logsCurrentPage}&limit=10`);
      if (logsRes.data.success) {
        setLogs(logsRes.data.data);
        setLogsTotalPages(logsRes.data.totalPages);
        setLogsTotalCount(logsRes.data.totalCount);
      }
    } catch (err) {
      console.error('Failed to query admin settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigsAndLogs();
  }, [logsCurrentPage]);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  // Submit new threshold configs
  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Validate weights sum to 1.0 (100%)
      const sum = weights.marks + weights.attendance + weights.assignment + weights.cgpa + weights.credits;
      if (Math.abs(sum - 1.0) > 0.001) {
        triggerFeedback('error', `Weights total must sum up to exactly 1.00 (Current: ${sum.toFixed(2)}).`);
        setSaving(false);
        return;
      }

      await Promise.all([
        API.put('/admin/config', { key: 'attendanceThreshold', value: attendanceThreshold }),
        API.put('/admin/config', { key: 'gpaThresholds', value: gpaThresholds }),
        API.put('/admin/config', { key: 'weights', value: weights }),
      ]);

      triggerFeedback('success', 'System assessment metrics updated successfully.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-64 bg-slate-200/60 rounded-2xl" />
        <div className="h-80 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {feedback.message && (
        <div className={`p-4 border rounded-2xl flex items-start gap-3 shadow-soft ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />}
          <div className="text-xs font-semibold">{feedback.message}</div>
        </div>
      )}

      {/* Threshold and Weights Form */}
      <form onSubmit={handleSaveConfigs} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft space-y-6">
        <div>
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-600" />
            Audit Parameters & Weight settings
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">Customize academic risk triggers and evaluation weights across the institution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-50">
          {/* General Limits */}
          <div className="space-y-4">
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Attendance limit</h5>
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-2">Required Attendance (%)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={attendanceThreshold}
                onChange={e => setAttendanceThreshold(parseInt(e.target.value) || 75)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* GPA risk zones */}
          <div className="space-y-4">
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">GPA Risk Boundaries</h5>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Crit Risk &lt;</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="10.0"
                  value={gpaThresholds.critical}
                  onChange={e => setGpaThresholds(prev => ({ ...prev, critical: parseFloat(e.target.value) || 5.0 }))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">High Risk &lt;</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="10.0"
                  value={gpaThresholds.high}
                  onChange={e => setGpaThresholds(prev => ({ ...prev, high: parseFloat(e.target.value) || 6.0 }))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Mod Risk &lt;</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="10.0"
                  value={gpaThresholds.moderate}
                  onChange={e => setGpaThresholds(prev => ({ ...prev, moderate: parseFloat(e.target.value) || 7.0 }))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Scoring weights */}
          <div className="space-y-3.5">
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Academic Score Weights</h5>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
              <div>
                <span>Exam Performance</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={weights.marks}
                  onChange={e => setWeights(prev => ({ ...prev, marks: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1 text-slate-800 text-center font-bold"
                />
              </div>
              <div>
                <span>Attendance rate</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={weights.attendance}
                  onChange={e => setWeights(prev => ({ ...prev, attendance: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1 text-slate-800 text-center font-bold"
                />
              </div>
              <div>
                <span>Assignment Marks</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={weights.assignment}
                  onChange={e => setWeights(prev => ({ ...prev, assignment: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1 text-slate-800 text-center font-bold"
                />
              </div>
              <div>
                <span>Normalized CGPA</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={weights.cgpa}
                  onChange={e => setWeights(prev => ({ ...prev, cgpa: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1 text-slate-800 text-center font-bold"
                />
              </div>
              <div className="col-span-2">
                <span>Credit Completion Rate</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={weights.credits}
                  onChange={e => setWeights(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1 text-slate-800 text-center font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-slate-50">
          <div className="flex gap-2 text-[10px] text-slate-400 font-bold max-w-sm leading-normal">
            <Info className="h-4.5 w-4.5 shrink-0 text-slate-400" />
            Changing weights recalculates the Overall Academic Score dynamically on subsequent loads.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Configs...' : 'Save Parameters'}
          </button>
        </div>
      </form>

      {/* Security Audit Activity Logs */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            Operational Audit Logs
          </h4>
          <p className="text-xs text-slate-400 mt-1">Audit trail monitoring logins, profile updates, and evaluation configurations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-6">Action Trigger</th>
                <th className="py-4 px-6">Details Description</th>
                <th className="py-4 px-6">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                    <td className="py-4 px-6 whitespace-nowrap text-slate-450 font-bold">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      {log.userId ? (
                        <div>
                          <span className="font-bold text-slate-900 block">{log.userId.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{log.userId.email} ({log.userId.role})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Anonymous</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border text-slate-700 tracking-wide">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-slate-400">{log.ip || '127.0.0.1'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No activity logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginated Logs footer */}
        {logsTotalPages > 1 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Logs: showing page {logsCurrentPage} of {logsTotalPages} (Total: {logsTotalCount})
            </span>
            <div className="flex gap-2">
              <button
                disabled={logsCurrentPage === 1}
                onClick={() => setLogsCurrentPage(prev => prev - 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                disabled={logsCurrentPage === logsTotalPages}
                onClick={() => setLogsCurrentPage(prev => prev + 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
