import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Stats {
  academicScore: number;
  cgpa: number;
  attendance: number;
  creditCompletion: number;
  riskLevel: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  skillMatch: number;
  careerGoal: string;
}

interface SemesterTrend {
  semester: string;
  examAvg: number;
  internalAvg: number;
  credits: number;
}

interface AttendanceBreakdown {
  subject: string;
  name: string;
  attendance: number;
}

interface AppNotification {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [semesterTrend, setSemesterTrend] = useState<SemesterTrend[]>([]);
  const [attendanceBreakdown, setAttendanceBreakdown] = useState<AttendanceBreakdown[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/dashboard/student');
        if (res.data.success) {
          const { stats, semesterTrend, attendanceBreakdown, notifications } = res.data.data;
          setStats(stats);
          setSemesterTrend(semesterTrend);
          setAttendanceBreakdown(attendanceBreakdown);
          setNotifications(notifications);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-32 bg-slate-200/60 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200/60 rounded-2xl" />
          <div className="h-28 bg-slate-200/60 rounded-2xl" />
          <div className="h-28 bg-slate-200/60 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200/60 rounded-2xl" />
          <div className="h-80 bg-slate-200/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center py-10 font-bold">Failed to load data.</div>;

  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL RISK':
        return { bg: 'bg-red-50 border-red-200 text-red-700', text: 'text-red-700', badge: 'bg-red-600 text-white' };
      case 'HIGH RISK':
        return { bg: 'bg-orange-50 border-orange-200 text-orange-700', text: 'text-orange-700', badge: 'bg-orange-500 text-white' };
      case 'MODERATE RISK':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-700', text: 'text-amber-700', badge: 'bg-amber-400 text-slate-900' };
      default:
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-700', badge: 'bg-emerald-600 text-white' };
    }
  };

  const riskStyle = getRiskStyle(stats.riskLevel);

  return (
    <div className="space-y-6">
      {/* Alert / Risk Alert */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border rounded-2xl flex items-start gap-3 shadow-soft ${
                notif.type === 'danger'
                  ? 'bg-red-50/70 border-red-200/60 text-red-800'
                  : notif.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200/60 text-amber-800'
                  : 'bg-blue-50/70 border-blue-200/60 text-blue-800'
              }`}
            >
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-semibold">
                {notif.message}
              </div>
              <button
                onClick={() => {
                  if (notif.type === 'danger') navigate('/academic-audit');
                  else if (notif.type === 'warning') navigate('/academic-audit');
                  else navigate('/skill-gap');
                }}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:opacity-85"
              >
                Resolve <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80 hover:shadow-premium transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Score</span>
            <div className="p-2.5 bg-brand-50 rounded-xl">
              <Sparkles className="h-5 w-5 text-brand-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.academicScore}/100</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Weighted assessment value</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80 hover:shadow-premium transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative GPA</span>
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <Award className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.cgpa.toFixed(2)}/10.00</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Reflects {stats.creditCompletion}% credit completion</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80 hover:shadow-premium transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Attendance</span>
            <div className="p-2.5 bg-teal-50 rounded-xl">
              <Calendar className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.attendance}%</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Minimum 75% required</p>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl border shadow-soft flex flex-col justify-between cursor-pointer hover:shadow-premium transition-all ${riskStyle.bg}`}
          onClick={() => navigate('/academic-audit')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">System Risk Status</span>
            <div className="p-2 bg-white/60 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black uppercase tracking-wider leading-none">{stats.riskLevel}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold mt-2 hover:underline">
              View Explanations <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA & Semester Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Academic History Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Internal test metrics compared to end semester exam results</p>
            </div>
            <Link to="/academic-audit" className="text-xs font-bold text-brand-600 hover:underline">Full Scorecard</Link>
          </div>
          <div className="h-80 w-full">
            {semesterTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semesterTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                  <Line name="End Sem Exam Avg" type="monotone" dataKey="examAvg" stroke="#3f5eec" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line name="Internal Test Avg" type="monotone" dataKey="internalAvg" stroke="#9db4f7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No trend data available.</div>
            )}
          </div>
        </div>

        {/* Skill Gap Analysis Box */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-premium border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              Career Readiness Index
            </div>
            <h3 className="text-2xl font-black tracking-tight mt-3">
              {stats.careerGoal}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              We mapped your current skills against industry standard competencies for a {stats.careerGoal} role.
            </p>

            <div className="mt-8 flex flex-col items-center">
              {/* Radial Score */}
              <div className="relative flex items-center justify-center h-32 w-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#3f5eec"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - stats.skillMatch / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white">{stats.skillMatch}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Match</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/skill-gap"
              className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-brand-600/10"
            >
              Analyze Skill Gaps & Roadmap
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance breakdown by subject */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Course Attendance Profile</h3>
            <p className="text-xs text-slate-400 font-medium">Subject-specific attendance rate against the critical 75% boundary</p>
          </div>
          <div className="h-64 w-full mt-6">
            {attendanceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                  <Bar dataKey="attendance" fill="#38abfa" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No course records found.</div>
            )}
          </div>
        </div>

        {/* Quick Links / Guide Card */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Companion Guides</h3>
            <p className="text-xs text-slate-400 font-medium">Quick shortcuts to platform components</p>
            
            <div className="mt-5 space-y-3.5">
              <Link to="/recommendations" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-brand-50/50 border border-slate-100 rounded-xl group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-100 transition-colors">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 leading-none">Learning Catalog</h5>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Study courses & tutorials</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link to="/profile" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-brand-50/50 border border-slate-100 rounded-xl group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-100 transition-colors">
                    <UserCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 leading-none">Skills Portfolio</h5>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Update certifications & skills</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-start gap-3 border border-slate-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">AI Chat Available</span>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                Click the floating "Ask Campus AI" widget on the bottom right to query suggestions customized for your scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
