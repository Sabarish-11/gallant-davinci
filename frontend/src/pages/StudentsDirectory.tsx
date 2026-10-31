import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface StudentProfile {
  cgpa: number;
  attendance: number;
  preferredCareer?: {
    name: string;
  };
}

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  batch: string;
  semester: number;
  profile: StudentProfile | null;
}

const StudentsDirectory: React.FC = () => {
  const navigate = useNavigate();

  // Student directory states
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Filter parameters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');

  // Fetch student listings
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8',
        search,
        department,
        semester,
        batch
      });

      const res = await API.get(`/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      }
    } catch (err) {
      console.error('Failed to query students directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, department, semester, batch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents();
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setSemester('');
    setBatch('');
    setCurrentPage(1);
  };

  const getRiskBadge = (cgpa: number, attendance: number) => {
    // Client-side quick risk estimation for badge rendering
    if (attendance < 60 || cgpa < 5.0) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 uppercase">Critical Risk</span>;
    }
    if (attendance < 75 || cgpa < 6.0) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-850 uppercase">High Risk</span>;
    }
    if (attendance < 80 || cgpa < 7.0) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-850 uppercase">Mod Risk</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-850 uppercase">Low Risk</span>;
  };

  const depts = ['Computer Science', 'Information Technology', 'Electronics Engineering', 'Mechanical Engineering'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, student ID, email..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            Apply Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter by:
            </span>

            {/* Department */}
            <select
              value={department}
              onChange={e => { setDepartment(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none"
            >
              <option value="">All Departments</option>
              {depts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Semester */}
            <select
              value={semester}
              onChange={e => { setSemester(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none"
            >
              <option value="">All Semesters</option>
              {semesters.map(s => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>

            {/* Batch */}
            <input
              type="text"
              value={batch}
              onChange={e => { setBatch(e.target.value); setCurrentPage(1); }}
              placeholder="Batch (e.g. 2023-2027)"
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none w-36"
            />
          </div>

          <button
            onClick={clearFilters}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">Student Directory Listing</h4>
            <p className="text-xs text-slate-400 mt-1">Total matching records: {totalCount}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="py-4 px-6">ID & Roll No</th>
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">Department & Sem</th>
                <th className="py-4 px-6 text-center">GPA</th>
                <th className="py-4 px-6 text-center">Attendance</th>
                <th className="py-4 px-6 text-center">Risk Tier</th>
                <th className="py-4 px-6 text-center">Career Path Target</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    Loading records directory...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((stud) => (
                  <tr key={stud._id} className="hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-900 block">{stud.studentId || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Batch: {stud.batch}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block">{stud.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{stud.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-800 block">{stud.department}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Semester {stud.semester}</span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-950">
                      {stud.profile?.cgpa ? stud.profile.cgpa.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-4 px-6 text-center font-bold">
                      {stud.profile?.attendance ? `${Math.round(stud.profile.attendance)}%` : '100%'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getRiskBadge(stud.profile?.cgpa || 0, stud.profile?.attendance || 100)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-[11px] text-brand-600 bg-brand-50/50 px-2 py-1 rounded-lg border border-brand-100">
                        {stud.profile?.preferredCareer?.name || 'Not Configured'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Audit link */}
                        <button
                          onClick={() => navigate(`/academic-audit?studentId=${stud._id}`)}
                          title="Generate Academic Audit"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-200"
                        >
                          <FileSpreadsheet className="h-4.5 w-4.5" />
                        </button>
                        {/* Skill gap link */}
                        <button
                          onClick={() => navigate(`/skill-gap?studentId=${stud._id}`)}
                          title="Analyze Skill Gaps"
                          className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors border border-transparent hover:border-violet-200"
                        >
                          <TrendingUp className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No matching student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
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

export default StudentsDirectory;
