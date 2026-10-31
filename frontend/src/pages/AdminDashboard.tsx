import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Users,
  Award,
  Layers,
  Compass,
  Settings,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Stats {
  totalStudents: number;
  totalFaculty: number;
  totalCareers: number;
  totalSkills: number;
  avgCgpa: number;
  avgAttendance: number;
  totalAtRisk: number;
}

interface RiskDist {
  name: string;
  value: number;
  color: string;
}

interface DeptComparison {
  department: string;
  cgpa: number;
  attendance: number;
  count: number;
}

interface CareerPref {
  name: string;
  studentsCount: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDist[]>([]);
  const [departmentComparison, setDepartmentComparison] = useState<DeptComparison[]>([]);
  const [careerPreferences, setCareerPreferences] = useState<CareerPref[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await API.get('/dashboard/admin');
        if (res.data.success) {
          const { stats, riskDistribution, departmentComparison, careerPreferences } = res.data.data;
          setStats(stats);
          setRiskDistribution(riskDistribution);
          setDepartmentComparison(departmentComparison);
          setCareerPreferences(careerPreferences);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-200/60 rounded-2xl" />
        </div>
        <div className="h-80 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  if (!stats) return <div className="text-center py-10 font-bold">Failed to load admin dashboard stats.</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalStudents}</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Enrolled active accounts</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Faculty</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalFaculty}</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Authorized evaluations</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Curated Careers</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalCareers}</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Available career profiles</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Curated Skills</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalSkills}</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">In master skills catalog</span>
        </div>
      </div>

      {/* Main Aggregation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institutional Risk distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">Institution Risk Cohorts</h4>
            <p className="text-xs text-slate-400 mt-1">Status of the general student population</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution.filter(r => r.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistribution.filter(r => r.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900">{stats.totalStudents}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Students</span>
            </div>
          </div>

          {/* Legends */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-[11px] font-bold">
            {riskDistribution.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-slate-600 truncate">{r.name}: <strong className="text-slate-800">{r.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Comparison chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">Department Performance Analytics</h4>
            <p className="text-xs text-slate-400 mt-1">GPA and Attendance comparison across major branches</p>
          </div>

          <div className="h-64 w-full mt-6">
            {departmentComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                  <Bar name="Average CGPA (x10)" dataKey="cgpa" fill="#3f5eec" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  <Bar name="Average Attendance %" dataKey="attendance" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No department data.</div>
            )}
          </div>
        </div>
      </div>

      {/* Career Preferences Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-500" />
            Top Selected Career Targets
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">Distribution of student career tracks mapped to our Curated Careers catalog</p>

          <div className="mt-6 space-y-4">
            {careerPreferences.length > 0 ? (
              careerPreferences.map((pref, i) => (
                <div key={pref.name} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 w-32 truncate">{pref.name}</span>
                  <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-brand-500" style={{ width: `${(pref.studentsCount / stats.totalStudents) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 w-12 text-right">{pref.studentsCount} studs</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No career selections made by students yet.</p>
            )}
          </div>
        </div>

        {/* Configurations Actions Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-500" />
              Administrative Tools
            </h4>
            <p className="text-xs text-slate-400 mt-1">Configure parameters and audit operational changes</p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/admin/config')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-brand-50/50 border border-slate-150 rounded-xl group w-full text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-100 transition-colors">
                    <Settings className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 leading-none">Threshold Configuration</h5>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Set GPA, Attendance limits</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/students')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-brand-50/50 border border-slate-150 rounded-xl group w-full text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-100 transition-colors">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 leading-none">User Directory Manager</h5>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Review enrollment files</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3 border border-slate-100 mt-6">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">Operational Audits Live</span>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                Every action (marks updates, logins, career updates) is logged with timestamp accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
