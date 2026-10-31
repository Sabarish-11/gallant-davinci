import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Users,
  Award,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  FileSpreadsheet,
  TrendingUp,
  Filter
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
  avgCgpa: number;
  avgAttendance: number;
  atRiskCount: number;
}

interface RiskDist {
  name: string;
  value: number;
  color: string;
}

interface AtRiskStudent {
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  semester: number;
  cgpa: number;
  attendance: number;
  riskLevel: 'HIGH RISK' | 'CRITICAL RISK';
  reasons: string[];
}

interface SubjectAverage {
  subject: string;
  name: string;
  averageScore: number;
  averageAttendance: number;
}

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDist[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<SubjectAverage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [semester, setSemester] = useState('');

  const fetchFacultyDashboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (batch) params.append('batch', batch);
      if (semester) params.append('semester', semester);

      const res = await API.get(`/dashboard/faculty?${params.toString()}`);
      if (res.data.success) {
        const { stats, riskDistribution, atRiskStudents, subjectAverages } = res.data.data;
        setStats(stats);
        setRiskDistribution(riskDistribution);
        setAtRiskStudents(atRiskStudents);
        setSubjectAverages(subjectAverages);
      }
    } catch (err) {
      console.error('Failed to query faculty dashboard aggregates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyDashboard();
  }, [department, batch, semester]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

  if (!stats) return <div className="text-center py-10 font-bold">Failed to load faculty summary.</div>;

  const depts = ['Computer Science', 'Information Technology', 'Electronics Engineering'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-slate-400" />
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Class Filters</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Filter statistics by batch or semester details</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Departments</option>
            {depts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Batch (e.g. 2023-2027)"
            value={batch}
            onChange={e => setBatch(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none w-44"
          />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/85 hover:shadow-premium transition-all">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned Students</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalStudents}</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Registered in selection</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/85 hover:shadow-premium transition-all">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Class Avg CGPA</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.avgCgpa.toFixed(2)}/10.00</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Institutional average</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/85 hover:shadow-premium transition-all">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Attendance Rate</span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.avgAttendance}%</h4>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">Minimum 75% target</span>
        </div>

        <div
          className={`p-6 rounded-2xl shadow-soft border flex flex-col justify-between cursor-pointer hover:shadow-premium transition-all ${
            stats.atRiskCount > 0 ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
          onClick={() => navigate('/students')}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">At-Risk Students</span>
            <h4 className="text-3xl font-extrabold mt-2">{stats.atRiskCount}</h4>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 mt-2">
            Verify Directory <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Risk Distribution and Subject Averages Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Pie chart */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">Academic Risk Distribution</h4>
            <p className="text-xs text-slate-400 mt-1">Classification breakdown of student cohorts</p>
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

        {/* Weakest Course Performance */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">Bottom Performing Subject Averages</h4>
            <p className="text-xs text-slate-400 mt-1">Courses with the lowest class average scores (combining exams, assignments, and internals)</p>
          </div>

          <div className="h-64 w-full mt-6">
            {subjectAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAverages} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                  <Bar name="Class Score Avg" dataKey="averageScore" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No course details available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Flagged High/Critical Risk Students lists */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Flagged At-Risk Students
          </h4>
          <p className="text-xs text-slate-400 mt-1">Actionable list of students requiring immediate mentoring or intervention reviews</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="py-4 px-6">Roll No</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6 text-center">GPA</th>
                <th className="py-4 px-6 text-center">Avg Attendance</th>
                <th className="py-4 px-6 text-center">Risk Level</th>
                <th className="py-4 px-6">Primary Triggers / Reasons</th>
                <th className="py-4 px-6 text-center">Action Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {atRiskStudents.length > 0 ? (
                atRiskStudents.map((stud) => (
                  <tr key={stud.studentId} className="hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                    <td className="py-4 px-6 font-bold text-slate-900">{stud.rollNumber}</td>
                    <td className="py-4 px-6 font-bold">{stud.name}</td>
                    <td className="py-4 px-6 text-center font-bold text-slate-950">{stud.cgpa.toFixed(2)}</td>
                    <td className="py-4 px-6 text-center font-bold text-slate-750">{stud.attendance}%</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        stud.riskLevel === 'CRITICAL RISK' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-850'
                      }`}>
                        {stud.riskLevel}
                      </span>
                    </td>
                    <td className="py-4 px-6 pr-4">
                      <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-500 font-semibold max-w-[300px]">
                        {stud.reasons.map((r, i) => (
                          <li key={i} className="truncate">{r}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => navigate(`/academic-audit?studentId=${stud.studentId}`)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          View Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No students currently flagged in High or Critical Risk categories. Excellent batch standing!
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

export default FacultyDashboard;
