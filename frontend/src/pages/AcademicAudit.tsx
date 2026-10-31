import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  TrendingDown,
  Info
} from 'lucide-react';

interface SubjectAudit {
  code: string;
  name: string;
  score: number;
  attendance: number;
  reason: string;
}

interface StrongSubject {
  code: string;
  name: string;
  score: number;
}

interface AuditData {
  academicScore: number;
  attendanceRate: number;
  assignmentAvg: number;
  creditCompletionRate: number;
  riskLevel: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  reasons: string[];
  weakSubjects: SubjectAudit[];
  strongSubjects: StrongSubject[];
  backlogsCount: number;
  totalCreditsRegistered: number;
  totalCreditsEarned: number;
  recommendations: string[];
}

interface AcademicRecord {
  _id: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number;
  assignmentMarks: number;
  examMarks: number;
  attendance: number;
  grade: string;
  passStatus: boolean;
}

interface StudentInfo {
  name: string;
  studentId: string;
  department: string;
  semester: number;
}

const AcademicAudit: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetStudentId = searchParams.get('studentId');

  const [audit, setAudit] = useState<AuditData | null>(null);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        let auditUrl = '/audit/me';
        let recordsUrl = '/academic-records';

        if (targetStudentId && user?.role !== 'STUDENT') {
          auditUrl = `/audit/student/${targetStudentId}`;
          recordsUrl = `/academic-records?studentId=${targetStudentId}`;
        }

        // Fetch Audit
        const auditRes = await API.get(auditUrl);
        if (auditRes.data.success) {
          setAudit(auditRes.data.data.audit);
          setAiInsights(auditRes.data.data.aiInsights);
          if (auditRes.data.data.student) {
            setStudentInfo(auditRes.data.data.student);
          } else if (user) {
            setStudentInfo({
              name: user.name,
              studentId: user.studentId || 'N/A',
              department: user.department || 'N/A',
              semester: user.semester || 1
            });
          }
        }

        // Fetch Academic Records (complete scorecard list)
        const recordsRes = await API.get(recordsUrl);
        if (recordsRes.data.success) {
          setRecords(recordsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch academic audit details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, [targetStudentId, user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-44 bg-slate-200/60 rounded-2xl" />
        <div className="h-64 bg-slate-200/60 rounded-2xl" />
        <div className="h-80 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  if (!audit || !studentInfo) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-800 mt-3">Audit Report Unavailable</h4>
        <p className="text-xs text-slate-500 mt-1">Please ensure correct student selection and academic entries.</p>
        {user?.role !== 'STUDENT' && (
          <button
            onClick={() => navigate('/students')}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Go to Directory
          </button>
        )}
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL RISK': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH RISK': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MODERATE RISK': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button for Faculty/Admin views */}
      {user?.role !== 'STUDENT' && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60 px-3.5 py-2 rounded-xl shadow-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students Directory
        </button>
      )}

      {/* Student Details Header */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">Student Audit File</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{studentInfo.name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 font-medium">
            <span>ID: <strong className="text-slate-700">{studentInfo.studentId}</strong></span>
            <span>Department: <strong className="text-slate-700">{studentInfo.department}</strong></span>
            <span>Current Semester: <strong className="text-slate-700">Sem {studentInfo.semester}</strong></span>
          </div>
        </div>
        
        <div className={`px-4 py-2.5 rounded-2xl border text-sm font-extrabold flex items-center gap-2 ${getRiskColor(audit.riskLevel)}`}>
          <ShieldCheck className="h-5 w-5" />
          Risk Classification: {audit.riskLevel}
        </div>
      </div>

      {/* Audit Performance Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Academic Score</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{audit.academicScore}/100</h4>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-3.5 overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: `${audit.academicScore}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Attendance</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{audit.attendanceRate}%</h4>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-3.5 overflow-hidden">
            <div className="h-full bg-teal-500" style={{ width: `${audit.attendanceRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assignment Performance</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{audit.assignmentAvg}%</h4>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-3.5 overflow-hidden">
            <div className="h-full bg-violet-500" style={{ width: `${audit.assignmentAvg}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Earned Credits</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{audit.totalCreditsEarned}/{audit.totalCreditsRegistered}</h4>
          <p className="text-[10px] font-semibold text-slate-400 mt-3">{audit.backlogsCount} active backlog courses</p>
        </div>
      </div>

      {/* Strengths & Weaknesses / AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trigger reasons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explainable Risk Details */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-brand-600" />
              Explainable Risk Indicators
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">System-generated triggers explaining this student's academic standing</p>

            <ul className="mt-4 space-y-3">
              {audit.reasons.map((r, index) => (
                <li key={index} className="flex gap-3 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100/80 p-3 rounded-xl">
                  <div className="h-5 w-5 rounded-full bg-slate-200/60 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {index + 1}
                  </div>
                  <span className="leading-normal">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Strengths and Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-soft">
              <h5 className="font-extrabold text-sm text-red-700 flex items-center gap-2 mb-3">
                <AlertCircle className="h-4.5 w-4.5" />
                Critical Weak Subject Areas
              </h5>
              {audit.weakSubjects.length > 0 ? (
                <div className="space-y-3">
                  {audit.weakSubjects.map((w) => (
                    <div key={w.code} className="p-3 bg-red-50/40 border border-red-100/60 rounded-xl">
                      <span className="font-bold text-xs text-red-950 block">{w.name} ({w.code})</span>
                      <div className="flex gap-3 mt-1.5 text-[10px] font-bold text-slate-500">
                        <span>Score: <strong className="text-red-700">{w.score}%</strong></span>
                        <span>Attendance: <strong>{w.attendance}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">No critical weaknesses detected in subject grades.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-soft">
              <h5 className="font-extrabold text-sm text-emerald-700 flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4.5 w-4.5" />
                Proven Strong Subject Areas
              </h5>
              {audit.strongSubjects.length > 0 ? (
                <div className="space-y-3">
                  {audit.strongSubjects.map((s) => (
                    <div key={s.code} className="p-3 bg-emerald-50/40 border border-emerald-100/60 rounded-xl">
                      <span className="font-bold text-xs text-emerald-950 block">{s.name} ({s.code})</span>
                      <span className="text-[10px] font-bold text-slate-500 mt-1 inline-block">Score: <strong className="text-emerald-700">{s.score}%</strong></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Performances are standard; try to target grades S/A to add strengths.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI advisor comments box */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-premium border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-brand-600 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Campus Advisor
            </span>
            <div className="mt-4 prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed space-y-3">
              {aiInsights ? (
                <div dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br />') }} />
              ) : (
                <p>Establishing secure connection for advisor insight summaries...</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-start gap-2.5">
            <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              These recommendation files are computed using rule thresholds populated in Admin Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Actionable recommendations lists */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
        <h4 className="font-extrabold text-base text-slate-900">Required Improvement Actions</h4>
        <p className="text-xs text-slate-400 mt-1">Actionable tasks derived from active GPA and credit deficiencies</p>
        <ul className="mt-4 space-y-2">
          {audit.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 items-center text-xs font-semibold text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100/60">
              <ChevronRight className="h-4.5 w-4.5 text-brand-500 shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Complete Scorecard details table */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-extrabold text-base text-slate-900">Academic History Scorecard</h4>
          <p className="text-xs text-slate-400 mt-1">Detailed list of courses, continuous internals, assignment performance, and attendance rates</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="py-4 px-6">Semester</th>
                <th className="py-4 px-6">Subject Code</th>
                <th className="py-4 px-6">Subject Name</th>
                <th className="py-4 px-6">Credits</th>
                <th className="py-4 px-6">Internals</th>
                <th className="py-4 px-6">Assignments</th>
                <th className="py-4 px-6">End Sem Exam</th>
                <th className="py-4 px-6">Attendance</th>
                <th className="py-4 px-6 text-center">Grade</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors font-medium text-slate-700">
                    <td className="py-4 px-6 font-bold text-slate-400">Sem {rec.semester}</td>
                    <td className="py-4 px-6 font-bold">{rec.subjectCode}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{rec.subjectName}</td>
                    <td className="py-4 px-6 font-bold">{rec.credits}</td>
                    <td className="py-4 px-6">{rec.internalMarks}/100</td>
                    <td className="py-4 px-6">{rec.assignmentMarks}/100</td>
                    <td className="py-4 px-6">{rec.examMarks}/100</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <span className="font-bold">{rec.attendance}%</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${rec.attendance < 75 ? 'bg-red-500' : 'bg-teal-500'}`}
                            style={{ width: `${rec.attendance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        rec.grade === 'S' || rec.grade === 'A'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : rec.grade === 'F'
                          ? 'bg-red-50 text-red-700 border border-red-100 font-black'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {rec.grade}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {rec.passStatus ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Pass</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">Backlog</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No scorecard records seeded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcademicAudit;
