import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Filter,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface Resource {
  _id: string;
  title: string;
  provider: string;
  url: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: string;
  type: 'COURSE' | 'BOOK' | 'VIDEO' | 'DOCUMENTATION';
}

interface SkillRecommendation {
  skillId: string;
  skillName: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  priorityValue: number;
  currentProficiency: string;
  requiredProficiency: string;
  whyItMatters: string;
  resources: Resource[];
  estimatedHours: number;
}

interface StudentDetails {
  name: string;
}

const Recommendations: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetStudentId = searchParams.get('studentId');

  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let url = '/recommendations/me';
        // Note: For simplicity, faculty see student gap which embeds roadmaps. But recommendations can also query student gap.
        if (targetStudentId && user?.role !== 'STUDENT') {
          // If viewing student gap, let's load from gap endpoint or redirect
          url = `/recommendations/me?studentId=${targetStudentId}`; // Mock fallback or query
        }

        const res = await API.get(url);
        if (res.data.success) {
          setRecommendations(res.data.data);
          if (user) {
            setStudentDetails({ name: user.name });
          }
        }
      } catch (err) {
        console.error('Failed to retrieve recommended learning resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [targetStudentId, user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-20 bg-slate-200/60 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 bg-slate-200/60 rounded-2xl" />
          <div className="h-60 bg-slate-200/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'ADVANCED': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'INTERMEDIATE': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            Filter Recommendations
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Narrow down by resource format or levels</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 appearance-none min-w-[120px]"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 appearance-none min-w-[120px]"
          >
            <option value="ALL">All Types</option>
            <option value="COURSE">Courses</option>
            <option value="BOOK">Books</option>
            <option value="VIDEO">Videos</option>
            <option value="DOCUMENTATION">Documentation</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-8">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => {
            // Apply filters to resources inside each recommendation block
            const filteredResources = rec.resources.filter(r => {
              const diffMatch = difficultyFilter === 'ALL' || r.difficulty === difficultyFilter;
              const typeMatch = typeFilter === 'ALL' || r.type === typeFilter;
              return diffMatch && typeMatch;
            });

            if (filteredResources.length === 0 && (difficultyFilter !== 'ALL' || typeFilter !== 'ALL')) {
              return null;
            }

            return (
              <div key={rec.skillId} className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                {/* Header panel */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900">{rec.skillName}</h4>
                      <span className="text-[9px] bg-slate-200/60 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{rec.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-1">{rec.whyItMatters}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 border rounded-lg ${getPriorityBadgeColor(rec.priority)}`}>
                      {rec.priority} Gaps
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Required proficiency: <strong>{rec.requiredProficiency}</strong>
                    </span>
                  </div>
                </div>

                {/* Recommendations Resource cards grid */}
                <div className="p-6">
                  {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredResources.map((res) => (
                        <div key={res._id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between h-44 transition-colors">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] bg-slate-200 text-slate-500 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">{res.type}</span>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 border rounded ${getDifficultyColor(res.difficulty)}`}>
                                {res.difficulty}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-950 mt-3 leading-snug line-clamp-2">{res.title}</h5>
                            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{res.provider}</span>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-500 font-semibold">Time: {res.duration}</span>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-500"
                            >
                              Open Resource
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-sm font-semibold">
                      No learning resources seeded matching difficulty "{difficultyFilter}" or type "{typeFilter}".
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center max-w-lg mx-auto">
            <HelpCircle className="h-12 w-12 text-slate-400 mx-auto" />
            <h4 className="font-extrabold text-slate-800 text-base mt-4">Recommendations Checklist Empty</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              If you have matched 100% of the target career requirements, no gaps are reported. Feel free to explore other careers!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
