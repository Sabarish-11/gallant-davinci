import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, KeyRound, Mail, Sparkles, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Login Handler
  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError('');
    setEmail(demoEmail);
    setPassword('Password123');

    try {
      const user = await login(demoEmail, 'Password123');
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { label: 'System Admin', email: 'admin@academic.edu', role: 'ADMIN', badge: 'Full Access' },
    { label: 'CS Head Faculty', email: 'faculty@academic.edu', role: 'FACULTY', badge: 'Drilldown Records' },
    { label: 'Siddharth (Student)', email: 'siddharth@academic.edu', role: 'STUDENT', badge: 'Low Risk | SWE Goal' },
    { label: 'Rohan (Student)', email: 'rohan@academic.edu', role: 'STUDENT', badge: 'Critical Risk | Backlogs' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Side Brand Panel */}
      <div className="w-full md:w-1/2 p-10 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-600 rounded-2xl shadow-xl shadow-brand-600/10 border border-brand-500/20">
            <Compass className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-none tracking-tight">Campus Companion</h1>
            <span className="text-xs text-brand-400 font-semibold tracking-wider uppercase">Audit & Gaps Analyzer</span>
          </div>
        </div>

        <div className="my-12 max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Transform Academic Records into Actionable Career intelligence.
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Multi-Modal AI audits class attendance, GPA performance indexes, and maps target skill gaps to generate personalized weekly roadmaps.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Campus Companion Engine. All rights reserved.
        </div>
      </div>

      {/* Main Login Form Panel */}
      <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center items-center bg-slate-950">
        <div className="w-full max-w-md">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Account Login</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Enter your credential files or pick a quick shortcut role.
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-xs text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Login Failed</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@academic.edu"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-600 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                <Link to="/register" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">Forgot Password?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <KeyRound className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-600 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-6"
            >
              Sign In to Platform
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950 px-3.5 text-slate-500 font-bold uppercase tracking-widest">Or Quick Sign In</span>
            </div>
          </div>

          {/* Quick Demo Accounts list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {demos.map((d) => (
              <button
                key={d.email}
                onClick={() => handleQuickLogin(d.email)}
                disabled={loading}
                className="p-3 text-left bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all group flex flex-col justify-between h-20 disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-white group-hover:text-brand-400 transition-colors">{d.label}</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{d.role}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight truncate mt-1">
                  {d.badge}
                </div>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Don't have a profile yet?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-bold">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
