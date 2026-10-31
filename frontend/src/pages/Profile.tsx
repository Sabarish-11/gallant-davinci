import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  User,
  Compass,
  Award,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Skill {
  _id: string;
  name: string;
  category: string;
}

interface Career {
  _id: string;
  name: string;
  description: string;
}

interface StudentSkill {
  name: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Master lists from DB
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [masterCareers, setMasterCareers] = useState<Career[]>([]);

  // Form states
  const [currentSkills, setCurrentSkills] = useState<StudentSkill[]>([]);
  const [preferredCareerId, setPreferredCareerId] = useState<string>('');
  const [learningPreferences, setLearningPreferences] = useState({
    mode: 'ONLINE',
    weeklyHours: 5,
  });

  // Inputs for adding skills
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch master careers & skills
        const [careersRes, skillsRes, meRes] = await Promise.all([
          API.get('/careers'),
          API.get('/skills'),
          API.get('/auth/me'),
        ]);

        if (careersRes.data.success) setMasterCareers(careersRes.data.data);
        if (skillsRes.data.success) setMasterSkills(skillsRes.data.data);

        // Load current profile data
        if (meRes.data.success && meRes.data.data.profile) {
          const profile = meRes.data.data.profile;
          setCurrentSkills(profile.skills || []);
          setPreferredCareerId(profile.preferredCareer?._id || '');
          setLearningPreferences(profile.learningPreferences || { mode: 'ONLINE', weeklyHours: 5 });
        }
      } catch (err) {
        console.error('Failed to load profile parameters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  // Add a skill to local state
  const handleAddSkill = () => {
    if (!newSkillName) return;

    // Check if skill already added
    const exists = currentSkills.some(s => s.name.toLowerCase() === newSkillName.toLowerCase());
    if (exists) {
      triggerFeedback('error', `Skill "${newSkillName}" is already in your list.`);
      return;
    }

    setCurrentSkills(prev => [...prev, { name: newSkillName, proficiency: newSkillProficiency }]);
    setNewSkillName('');
  };

  // Remove skill from local state
  const handleRemoveSkill = (name: string) => {
    setCurrentSkills(prev => prev.filter(s => s.name !== name));
  };

  // Update proficiency in local state
  const handleProficiencyChange = (name: string, proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => {
    setCurrentSkills(prev => prev.map(s => s.name === name ? { ...s, proficiency } : s));
  };

  // Save all changes to the backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save Skills
      await API.put('/students/me/skills', { skills: currentSkills });

      // 2. Save Target Career
      await API.put('/students/me/career', { preferredCareerId: preferredCareerId || null });

      // 3. Save Preferences
      await API.put('/students/me', { learningPreferences });

      await refreshUser();
      triggerFeedback('success', 'Profile and skill alignments updated successfully!');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-40 bg-slate-200/60 rounded-2xl" />
        <div className="h-80 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {feedback.message && (
        <div className={`p-4 border rounded-2xl flex items-start gap-3 shadow-soft ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <div className="text-xs font-semibold">{feedback.message}</div>
        </div>
      )}

      {/* User Information Display Card */}
      {user && (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/80 flex items-center gap-4">
          <div className="h-16 w-16 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{user.name}</h3>
            <span className="text-xs text-slate-400 font-semibold">{user.email}</span>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded border">ID: {user.studentId}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border">DEPT: {user.department}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded border">BATCH: {user.batch}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Career & Studies Setup */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 space-y-5">
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Compass className="h-5 w-5 text-brand-600" />
            Target Career & Schedule Configuration
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">Customize your preferred post-college role and learning speed metrics</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3">
            {/* Preferred Career */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Target Career Role</label>
              <select
                value={preferredCareerId}
                onChange={e => setPreferredCareerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Choose Target Career --</option>
                {masterCareers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Study hours per week */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Weekly Study Availability (Hrs)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={learningPreferences.weeklyHours}
                onChange={e => setLearningPreferences(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 5 }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Preferred mode */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Preferred Study Format</label>
              <div className="flex gap-3">
                {['ONLINE', 'OFFLINE', 'HYBRID'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLearningPreferences(prev => ({ ...prev, mode: m }))}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      learningPreferences.mode === m
                        ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Portfolio Section */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 space-y-6">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-600" />
              Skill alignment Portfolio
            </h4>
            <p className="text-xs text-slate-400 mt-1">Manage your active technical skillset and edit proficiency grades</p>
          </div>

          {/* Add skill tag inline form */}
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row gap-3.5 items-end">
            <div className="flex-1 w-full">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Select Skill Name</label>
              <select
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="">-- Select master Skill --</option>
                {masterSkills.map((sk) => (
                  <option key={sk._id} value={sk.name}>{sk.name} ({sk.category})</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-44">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Proficiency Grade</label>
              <select
                value={newSkillProficiency}
                onChange={e => setNewSkillProficiency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddSkill}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>

          {/* Current Skills list tags */}
          <div className="space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">My Current Skillset:</span>
            {currentSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentSkills.map((sk) => (
                  <div key={sk.name} className="flex items-center justify-between p-3 border border-slate-200/70 bg-white rounded-xl shadow-soft">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-850 block truncate">{sk.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium leading-none block mt-0.5">
                        Category: {masterSkills.find(s => s.name === sk.name)?.category || 'Other'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <select
                        value={sk.proficiency}
                        onChange={e => handleProficiencyChange(sk.name, e.target.value as any)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk.name)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-semibold italic py-2 text-center bg-slate-50 rounded-xl">Your skills portfolio is empty. Add skills above.</p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3.5">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/10 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Portfolio...' : 'Save Profile Alignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
