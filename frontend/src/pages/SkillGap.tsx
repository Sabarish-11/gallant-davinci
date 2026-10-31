import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

interface SkillGapItem {
  skillId: string;
  name: string;
  category: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  currentProficiency?: string;
  requiredProficiency: string;
  priority: number;
  reason: string;
}

interface MatchedSkillItem {
  skillId: string;
  name: string;
  category: string;
  currentProficiency: string;
  requiredProficiency: string;
}

interface GapAnalysis {
  hasTargetCareer: boolean;
  careerId: string;
  careerName: string;
  careerDescription: string;
  matchPercentage: number;
  matchedSkills: MatchedSkillItem[];
  partialSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
}

interface RoadmapResource {
  title: string;
  url: string;
  provider: string;
}

interface RoadmapWeek {
  weekNumber: number;
  focus: string;
  objectives: string[];
  estimatedHours: number;
  resources: RoadmapResource[];
}

interface RoadmapData {
  explanation: string;
  weeks: RoadmapWeek[];
}

interface StudentDetails {
  name: string;
  email: string;
}

const SkillGap: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetStudentId = searchParams.get('studentId');

  const [gap, setGap] = useState<GapAnalysis | null>(null);
  const [aiInsights, setAiInsights] = useState('');
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillGapData = async () => {
      try {
        setLoading(true);
        let url = '/skill-gap/me';
        if (targetStudentId && user?.role !== 'STUDENT') {
          url = `/skill-gap/student/${targetStudentId}`;
        }

        const res = await API.get(url);
        if (res.data.success) {
          const { gapAnalysis, aiInsights, roadmap, student } = res.data.data;
          setGap(gapAnalysis);
          setAiInsights(aiInsights);
          setRoadmap(roadmap);
          if (student) {
            setStudentDetails(student);
          } else if (user) {
            setStudentDetails({ name: user.name, email: user.email });
          }
        }
      } catch (err) {
        console.error('Failed to retrieve skill gaps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillGapData();
  }, [targetStudentId, user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-44 bg-slate-200/60 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200/60 rounded-2xl lg:col-span-2" />
          <div className="h-80 bg-slate-200/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Handle case where target career is not set
  if (gap && !gap.hasTargetCareer) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100/80 text-center max-w-lg mx-auto mt-10">
        <HelpCircle className="h-12 w-12 text-slate-400 mx-auto" />
        <h4 className="font-extrabold text-slate-800 text-lg mt-4">Career Goal Unspecified</h4>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {user?.role === 'STUDENT'
            ? "To generate a skill gap assessment and personalized learning roadmap, you must select your preferred career pathway (e.g. Software Engineer) first."
            : "This student has not set their preferred career pathway yet."}
        </p>
        
        {user?.role === 'STUDENT' ? (
          <button
            onClick={() => navigate('/profile')}
            className="mt-6 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/10 transition-all flex items-center justify-center gap-1 mx-auto"
          >
            Update Target Career <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/students')}
            className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors mx-auto"
          >
            Back to Directory
          </button>
        )}
      </div>
    );
  }

  if (!gap || !studentDetails) {
    return <div className="text-center py-10 font-bold">Failed to load gap reports.</div>;
  }

  const getPriorityBadgeColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-700 bg-red-50 border-red-200';
      case 2: return 'text-orange-700 bg-orange-50 border-orange-200';
      case 3: return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Priority 1 (Critical Missing)';
      case 2: return 'Priority 2 (High-Priority Upgrade)';
      case 3: return 'Priority 3 (Medium Missing)';
      default: return 'Priority 4/5 (Medium Upgrade / Low Priority)';
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

      {/* Header Summary */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-premium border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="text-[9px] bg-brand-600 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded">Competency Alignment</span>
          <h3 className="text-2xl font-black text-white mt-2 leading-tight">Career Gap File: {gap.careerName}</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">{gap.careerDescription}</p>
          {user?.role !== 'STUDENT' && (
            <p className="text-xs text-slate-400 font-semibold mt-3">
              Reviewing profile stats for: <strong className="text-white">{studentDetails.name}</strong> ({studentDetails.email})
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800 p-4 rounded-2xl min-w-[200px]">
          <div className="text-center">
            <span className="text-3xl font-black block text-brand-400">{gap.matchPercentage}%</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Matched Index</span>
          </div>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: `${gap.matchPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Gaps List & AI Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Gaps lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Missing Skills Grid */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Missing Skills Gaps
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Competencies required for a {gap.careerName} that are not present in your profile</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {gap.missingSkills.length > 0 ? (
                gap.missingSkills.map((sk) => (
                  <div key={sk.name} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between h-32">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate max-w-[150px]">{sk.name}</span>
                        <span className="text-[9px] bg-slate-200/60 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{sk.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed truncate">{sk.reason}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${getPriorityBadgeColor(sk.priority)}`}>
                        {getPriorityLabel(sk.priority)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Goal: {sk.requiredProficiency}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 p-6 text-center text-slate-400 font-medium">
                  No missing skill gaps. Excellent job!
                </div>
              )}
            </div>
          </div>

          {/* Partial Skills Grid */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Skills Requiring Upgrades
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Core competencies that require a higher level of proficiency in {gap.careerName}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {gap.partialSkills.length > 0 ? (
                gap.partialSkills.map((sk) => (
                  <div key={sk.name} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between h-32">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate max-w-[150px]">{sk.name}</span>
                        <span className="text-[9px] bg-slate-200/60 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{sk.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed truncate">{sk.reason}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${getPriorityBadgeColor(sk.priority)}`}>
                        {getPriorityLabel(sk.priority)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{sk.currentProficiency} → {sk.requiredProficiency}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 p-6 text-center text-slate-400 font-medium">
                  No partial skill gaps found. All matching skills are at correct standards!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Summaries and Strengths */}
        <div className="space-y-6">
          {/* AI Gap Insights comment */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-premium border border-slate-800">
            <span className="text-[10px] bg-brand-600 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Coach Insights
            </span>
            <div className="mt-4 text-xs leading-relaxed text-slate-300 space-y-3 prose prose-invert">
              {aiInsights ? (
                <div dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br />') }} />
              ) : (
                <p>Generating technical career gap assessment comments...</p>
              )}
            </div>
          </div>

          {/* Matched / Strong Skills list */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-4">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              Your Strengths (Matched Skills)
            </h5>
            {gap.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gap.matchedSkills.map((sk) => (
                  <span
                    key={sk.name}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {sk.name}
                    <span className="text-[9px] bg-emerald-100 px-1 py-0.2 rounded font-black">{sk.currentProficiency}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No verified matches in this career track yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Week-by-week learning roadmap timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
        <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-600" />
          Personalized Weekly Study Roadmap
        </h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          4-week learning guide customized according to your weekly hours ({user?.role === 'STUDENT' ? user.semester : 'selected'} schedule) and skills requirements
        </p>

        {roadmap ? (
          <div className="mt-8 space-y-8 relative before:absolute before:inset-0 before:left-4 before:top-4 before:-bottom-4 before:w-0.5 before:bg-slate-100">
            {roadmap.weeks.map((week) => (
              <div key={week.weekNumber} className="relative pl-10 group">
                {/* Visual Circle Node */}
                <div className="absolute left-0.5 top-0.5 w-7.5 h-7.5 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:bg-brand-600 transition-colors shadow-soft border-4 border-white">
                  {week.weekNumber}
                </div>

                {/* Week card container */}
                <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-soft">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h5 className="font-black text-slate-900 text-sm">
                      Week {week.weekNumber}: {week.focus}
                    </h5>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
                      Study Time: {week.estimatedHours} hours
                    </span>
                  </div>

                  {/* Objectives */}
                  <div className="mt-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Objectives:</span>
                    <ul className="mt-2 space-y-1.5">
                      {week.objectives.map((obj, oi) => (
                        <li key={oi} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                          <span className="h-1.5 w-1.5 bg-brand-500 rounded-full shrink-0 mt-1.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Curated Resources */}
                  {week.resources && week.resources.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Recommended Learning Materials:</span>
                      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {week.resources.map((res, ri) => (
                          <a
                            key={ri}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white hover:bg-brand-50/40 border border-slate-200/60 hover:border-brand-200 rounded-xl flex items-center justify-between group/link transition-colors shadow-soft"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-xs text-slate-800 block truncate group-hover/link:text-brand-600 transition-colors">{res.title}</span>
                              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{res.provider}</span>
                            </div>
                            <ArrowUpRight className="h-4.5 w-4.5 text-slate-300 group-hover/link:text-brand-600 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 font-semibold">No study roadmap generated yet.</div>
        )}
      </div>
    </div>
  );
};

export default SkillGap;
