import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, KeyRound, User, BookOpen, Fingerprint, CalendarDays, Hash, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [batch, setBatch] = useState('2023-2027');
  const [semester, setSemester] = useState(4);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !studentId || !batch) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        password,
        role: 'STUDENT',
        studentId,
        department,
        batch,
        semester
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const depts = [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Side Brand Panel */}
      <div className="w-full md:w-5/12 p-10 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-600 rounded-2xl shadow-xl border border-brand-500/20">
            <Compass className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-none tracking-tight">Campus Companion</h1>
            <span className="text-xs text-brand-400 font-semibold tracking-wider uppercase">Audit & Gaps Analyzer</span>
          </div>
        </div>

        <div className="my-12">
          <h2 className="text-2xl font-extrabold tracking-tight leading-tight text-white">
            Create Student Profile
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Fill in your enrollment details to set up your profile. We will automatically create an academic scorecard that calculates risk triggers and highlights target carrier gaps.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Campus Companion Engine.
        </div>
      </div>

      {/* Register Form */}
      <div className="w-full md:w-7/12 p-8 lg:p-12 bg-slate-950 flex justify-center items-center">
        <div className="w-full max-w-lg">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Create Student Account</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Register using your official university registration credentials.</p>
          </div>

          {error && (
            <div className="mt-5 p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-xs text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Registration Failed</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sabarish"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white placeholder-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sabar@academic.edu"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white placeholder-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Student ID / Roll No</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Fingerprint className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="CS2023015"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white placeholder-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Department</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white disabled:opacity-50 appearance-none"
                >
                  {depts.map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Batch (e.g. 2023-2027)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <CalendarDays className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={batch}
                  onChange={e => setBatch(e.target.value)}
                  placeholder="2023-2027"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white placeholder-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Current Semester</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Hash className="h-4.5 w-4.5" />
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  max={8}
                  value={semester}
                  onChange={e => setSemester(parseInt(e.target.value))}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Choose Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <KeyRound className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white placeholder-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="sm:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                Create Account Profile
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
