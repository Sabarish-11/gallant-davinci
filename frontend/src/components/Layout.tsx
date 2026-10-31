import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  TrendingUp,
  BookOpen,
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
  ShieldAlert,
  Users,
  Compass,
  Sparkles
} from 'lucide-react';
import AIChatCompanion from './AIChatCompanion';

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ElementType;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return <>{children}</>;

  // Get navigation links based on roles
  const getLinks = (): SidebarLink[] => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/academic-audit', label: 'Academic Audit', icon: FileSpreadsheet },
          { to: '/skill-gap', label: 'Skill Gap & Roadmap', icon: TrendingUp },
          { to: '/recommendations', label: 'Learning Resources', icon: BookOpen },
          { to: '/profile', label: 'My Profile', icon: UserCircle },
        ];
      case 'FACULTY':
        return [
          { to: '/faculty-dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { to: '/students', label: 'Students Directory', icon: Users },
        ];
      case 'ADMIN':
        return [
          { to: '/admin-dashboard', label: 'Admin Analytics', icon: LayoutDashboard },
          { to: '/admin/config', label: 'Settings & Configurations', icon: Settings },
          { to: '/students', label: 'User Directory', icon: Users },
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinks();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out border-r border-slate-800 lg:relative lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500 rounded-xl shadow-lg">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg leading-none tracking-tight block">CompanionAI</span>
              <span className="text-[10px] text-brand-300 font-semibold tracking-wider uppercase">Campus Hub</span>
            </div>
          </Link>
          <button
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-11 w-11 rounded-full bg-brand-600 text-white font-bold text-lg shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate text-slate-100">{user.name}</h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5 items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase tracking-wider">
              {user.role}
            </span>
            {user.department && (
              <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                • {user.department}
              </span>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-slate-100 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden border border-slate-200/80"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'Student Dashboard'
                  : location.pathname === '/faculty-dashboard'
                  ? 'Faculty Dashboard'
                  : location.pathname === '/admin-dashboard'
                  ? 'Institution Administrator'
                  : navLinks.find((l) => l.to === location.pathname)?.label || 'Academic Panel'}
              </h2>
              <p className="hidden sm:block text-xs text-slate-500 font-medium mt-0.5">
                Welcome back, {user.name}. Track your performance index and skill alignments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'STUDENT' && user.semester && (
              <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                Semester {user.semester}
              </div>
            )}
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* Floating AI Chat Assistant for Students */}
      {user.role === 'STUDENT' && <AIChatCompanion />}
    </div>
  );
};

export default Layout;
