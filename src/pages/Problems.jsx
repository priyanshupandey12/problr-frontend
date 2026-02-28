import { useState, useEffect } from 'react';
import { problemAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";


const CATEGORIES = [
  { label: "All Problems",  emoji: "•",   value: "" },
  { label: "Healthcare",    emoji: "🏥",  value: "healthcare" },
  { label: "Housing",       emoji: "🏠",  value: "housing" },
  { label: "Transportation",emoji: "🚌",  value: "transportation" },
  { label: "Education",     emoji: "🎓",  value: "education" },
  { label: "Finance",       emoji: "💰",  value: "finance" },
  { label: "Workplace",     emoji: "💼",  value: "workplace" },
  { label: "Retail",        emoji: "🛒",  value: "shopping-retail" },
  { label: "Government",    emoji: "🏛️", value: "government-services" },
  { label: "Community",     emoji: "🌿",  value: "social-community" },
  { label: "Productivity",  emoji: "⚙️", value: "productivity" },
  { label: "Other",         emoji: "📦",  value: "other" },
];

const PAIN_LEVELS = [
  { label: "Safety Risk",        emoji: "🚨", value: "safety-risk",        bg: "#2a1212", color: "#ff6b6b", border: "#3a1a1a" },
  { label: "Stressful",          emoji: "😩", value: "stressful",          bg: "#2a1e10", color: "#ffaa44", border: "#3a2a10" },
  { label: "Costs Money",        emoji: "💸", value: "costs-money",        bg: "#101e2a", color: "#44aaff", border: "#102a3a" },
  { label: "Time Consuming",     emoji: "⏱️",value: "time-consuming",     bg: "#12102a", color: "#9a8fff", border: "#1a1a3a" },
  { label: "Mild Inconvenience", emoji: "😐", value: "mild-inconvenience", bg: "#101a10", color: "#44cc88", border: "#102a10" },
];

const FREQUENCIES = [
  { label: "Daily",           emoji: "📅", value: "daily",          bg: "#101e2a", color: "#60a5fa" },
  { label: "Weekly",          emoji: "🗓️",value: "weekly",         bg: "#12102a", color: "#818cf8" },
  { label: "Monthly",         emoji: "📆", value: "monthly",        bg: "#101a18", color: "#34d399" },
  { label: "Rare but Serious",emoji: "⚠️",value: "rare-but-serious",bg: "#1e1028", color: "#c084fc" },
];

const SORT_OPTIONS = [
  { label: "Highest Priority", value: "priority"    },
  { label: "Most Recent",      value: "recent"      },
  { label: "Most Submissions", value: "submissions" },
  { label: "Deadline Soon",    value: "deadline"    },
];

const PAIN_META = Object.fromEntries(PAIN_LEVELS.map(p => [p.value, p]));
const FREQ_META = Object.fromEntries(FREQUENCIES.map(f => [f.value, f]));
const PAIN_EMOJI = {
  'safety-risk': '🚨', 'stressful': '😩', 'costs-money': '💸',
  'time-consuming': '⏱️', 'mild-inconvenience': '😐',
};

export default function ProblemsPage() {
  const [problems,   setProblems]   = useState([]);
  const { getToken } = useAuth();
  const [votingId, setVotingId] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [filters,    setFilters]    = useState({
    search: '', category: '', painLevel: '', frequency: '',
    affectedAudience: '', sortBy: 'recent', page: 1, limit: 10,
  });

  useEffect(() => { fetchProblems(); }, [filters]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await problemAPI.getAllProblems(filters);
      setProblems(data.problems || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };


const handleVoteProblem = async (e, problemId) => {
  e.stopPropagation(); // card click navigate na kare
  setVotingId(problemId);
  try {
    const token = await getToken();
    const res = await problemAPI.voteProblem(token, problemId);
    setProblems(prev => prev.map(p =>
      p._id === problemId
        ? { ...p, upvotes: res.upvotes, upvotedBy: res.hasUpvoted
            ? [...(p.upvotedBy || []), 'me']
            : (p.upvotedBy || []).slice(0, -1)
          }
        : p
    ));
  } catch (err) {
    console.error('Vote error:', err?.response?.data?.error || err.message);
  } finally {
    setVotingId(null);
  }
};

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () =>
    setFilters({ search: '', category: '', painLevel: '', frequency: '',
      affectedAudience: '', sortBy: 'recent', page: 1, limit: 10 });

  const getTimeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const hasActiveFilters = filters.category || filters.painLevel || filters.frequency || filters.search;

  return (
  
    <div className="flex" style={{ minHeight: '100vh', background: '#0a0a0a', paddingTop: '76px' }}>

   
      <aside
        className="sidebar-scroll flex-shrink-0 overflow-y-auto"
        style={{
          width: '252px',
          background: '#0d0d0d',
          borderRight: '1px solid #1a1a1a',
          padding: '20px 14px',
          position: 'sticky',
          top: '76px',                       
          height: 'calc(100vh - 76px)',
        }}
      >
       
        <p className="text-[0.6rem] font-bold tracking-widest uppercase mb-2" style={{ color: '#3a3a3a' }}>
          Category
        </p>
        <div className="flex flex-col gap-0.5 mb-5">
          {CATEGORIES.map(cat => {
            const active = filters.category === cat.value;
            return (
              <button key={cat.value}
                onClick={() => updateFilter('category', cat.value)}
                className="flex items-center gap-2 w-full px-3 py-[6px] rounded-lg text-left transition-all duration-150"
                style={{
                  background: active ? '#1c1c1c' : 'transparent',
                  border: `1px solid ${active ? '#2a2a2a' : 'transparent'}`,
                }}>
                <span className="text-[0.82rem]">{cat.emoji}</span>
                <span className="text-[0.76rem]" style={{ color: active ? '#f0f0f5' : '#666' }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>


        <p className="text-[0.6rem] font-bold tracking-widest uppercase mb-2" style={{ color: '#3a3a3a' }}>
          Pain Level
        </p>
        <div className="flex flex-col gap-0.5 mb-5">
          {PAIN_LEVELS.map(p => {
            const active = filters.painLevel === p.value;
            return (
              <button key={p.value}
                onClick={() => updateFilter('painLevel', active ? '' : p.value)}
                className="flex items-center gap-2 w-full px-3 py-[6px] rounded-lg text-left transition-all duration-150"
                style={{
                  background: active ? p.bg : 'transparent',
                  border: `1px solid ${active ? p.border : 'transparent'}`,
                }}>
                <span className="text-[0.82rem]">{p.emoji}</span>
                <span className="text-[0.76rem]" style={{ color: active ? p.color : '#666' }}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

      
        <p className="text-[0.6rem] font-bold tracking-widest uppercase mb-2" style={{ color: '#3a3a3a' }}>
          Frequency
        </p>
        <div className="flex flex-col gap-0.5">
          {FREQUENCIES.map(f => {
            const active = filters.frequency === f.value;
            return (
              <button key={f.value}
                onClick={() => updateFilter('frequency', active ? '' : f.value)}
                className="flex items-center gap-2 w-full px-3 py-[6px] rounded-lg text-left transition-all duration-150"
                style={{
                  background: active ? f.bg : 'transparent',
                  border: `1px solid ${active ? '#2a2a3a' : 'transparent'}`,
                }}>
                <span className="text-[0.82rem]">{f.emoji}</span>
                <span className="text-[0.76rem]" style={{ color: active ? f.color : '#666' }}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

    
      <main className="flex-1 px-7 py-6" style={{ minWidth: 0 }}>

     
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: '#f0f0f5' }}>
            All Problems
            {!loading && (
              <span className="ml-2 text-[0.7rem] font-normal" style={{ color: '#797575' }}>
                {problems.length} found
              </span>
            )}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
        
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: '#141414', border: '1px solid #222' }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 20 20">
                <circle cx="9" cy="9" r="6" stroke="#444" strokeWidth="2"/>
                <path d="M14 14l4 4" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input placeholder="Search problems..."
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className="bg-transparent outline-none text-[0.76rem] w-40"
                style={{ color: '#ffffff' }}
              />
            </div>

    
            <select value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value)}
              className="px-3 py-1.5 rounded-full text-[0.74rem] font-medium outline-none cursor-pointer"
              style={{ background: '#141414', border: '1px solid #222', color: '#aaa', colorScheme: 'dark' }}>
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

          
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="text-[0.7rem] font-medium px-3 py-1.5 rounded-full transition-all"
                style={{ color: '#ff5c3a', border: '1px solid #2a1010', background: 'transparent', cursor: 'pointer' }}>
                Clear filters
              </button>
            )}
          </div>
        </div>

 
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-6 h-6 rounded-full border-2"
              style={{ borderColor: '#2a2a2a', borderTopColor: '#ff5c3a', animation: 'spin 0.8s linear infinite' }} />
            <p className="text-[0.78rem]" style={{ color: '#444' }}>Loading problems...</p>
          </div>

 
        ) : problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-[0.88rem]" style={{ color: '#444' }}>No problems found</p>
            <button onClick={clearFilters}
              className="text-[0.74rem] font-semibold px-5 py-2 rounded-full"
              style={{ background: '#ff5c3a', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>

   
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {problems.map(problem => {
                const pm    = PAIN_META[problem.painLevel] || {};
                const fm    = FREQ_META[problem.frequency] || {};
                const dl    = getDaysLeft(problem.deadline);
                const urgent = dl !== 'Expired' && (dl === 'Today' || parseInt(dl) <= 3);

                return (
          <div key={problem._id}
                                className="rounded-xl p-5 cursor-pointer transition-all duration-200"
                                style={{ background: '#111111', border: '1px solid #1c1c1c', borderLeft: '3px solid transparent' }}
                                onClick={() => navigate(`/problems/${problem._id}`)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#2c2c2c';
                                    e.currentTarget.style.borderLeft = '3px solid #ff5c3a';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#1c1c1c';
                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                }}
                                >
                
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[0.63rem] font-medium px-2 py-0.5 rounded-md"
                          style={{ background: '#161625', color: '#8888ee', border: '1px solid #22224a' }}>
                          📁 {problem.category}
                        </span>
                        {pm.color && (
                          <span className="text-[0.63rem] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: pm.bg, color: pm.color, border: `1px solid ${pm.border}` }}>
                            {PAIN_EMOJI[problem.painLevel]} {pm.label}
                          </span>
                        )}
                        {fm.color && (
                          <span className="text-[0.63rem] font-medium px-2 py-0.5 rounded-md"
                            style={{ background: fm.bg, color: fm.color, border: '1px solid #1e2035' }}>
                            📅 {problem.frequency}
                          </span>
                        )}
                        <span className="text-[0.63rem] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            background: urgent ? '#1e0e0e' : '#161616',
                            color:      urgent ? '#ff5c3a' : '#555',
                            border:    `1px solid ${urgent ? '#3a1a1a' : '#222'}`,
                          }}>
                          📅 {dl}
                        </span>
                      </div>

                      {problem.priorityScore !== undefined && (
                        <span className="text-[0.63rem] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: '#1a1800', color: '#c8a400', border: '1px solid #2a2600' }}>
                          ⚡ {problem.priorityScore}/9
                        </span>
                      )}
                    </div>

               
                    <h3 className="font-bold leading-snug mb-1.5 text-[0.9rem]" style={{ color: '#f0f0f5' }}>
                      {problem.title}
                    </h3>

                 
                    <p className="text-[0.74rem] leading-relaxed mb-4" style={{ color: '#4a4a4a' }}>
                      {problem.description?.length > 170
                        ? `${problem.description.substring(0, 170)}...`
                        : problem.description}
                    </p>

                   
                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: '1px solid #181818' }}>
                      <div className="flex items-center gap-2">
                        {problem.postedBy?.profilePicture ? (
                          <img src={problem.postedBy.profilePicture} alt=""
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.62rem] font-bold flex-shrink-0"
                            style={{ background: '#ff5c3a', color: '#fff' }}>
                            {problem.postedBy?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <span className="text-[0.7rem] font-medium" style={{ color: '#777' }}>
                          {problem.postedBy?.name || 'Anonymous'}
                        </span>
                        {problem.postedBy?.location && (
                          <>
                            <span style={{ color: '#2a2a2a' }}>·</span>
                            <span className="text-[0.68rem]" style={{ color: '#444' }}>
                              {problem.postedBy.location}
                            </span>
                          </>
                        )}
                        <span style={{ color: '#2a2a2a' }}>·</span>
                        <span className="text-[0.66rem]" style={{ color: '#5f5e5e' }}>
                          {getTimeAgo(problem.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[0.68rem]" style={{ color: '#746f6f' }}>
                          📝 {problem.submissionCount ?? 0} submissions
                        </span>
                             <button
    onClick={(e) => handleVoteProblem(e, problem._id)}
    disabled={votingId === problem._id}
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all disabled:opacity-50"
    style={{
      background: 'transparent',
      borderColor: problem.upvotedBy?.includes('me') ? '#ff5c3a' : '#2a2a2a',
      cursor: 'pointer'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff5c3a'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 
      problem.upvotedBy?.includes('me') ? '#ff5c3a' : '#2a2a2a'
    }
  >
    {votingId === problem._id ? (
      <div className="w-2.5 h-2.5 rounded-full border border-neutral-600 border-t-white animate-spin" />
    ) : (
      <svg width="9" height="9" fill="none" viewBox="0 0 24 24">
        <path d="M12 19V5M5 12l7-7 7 7"
          stroke={problem.upvotedBy?.includes('me') ? '#ff5c3a' : '#555'}
          strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    )}
    <span className="text-[0.65rem] font-bold"
      style={{ color: problem.upvotedBy?.includes('me') ? '#ff5c3a' : '#555' }}>
      {problem.upvotes || 0}
    </span>
  </button>
                        
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>



         
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-lg text-[0.74rem] font-medium"
                  style={{
                    background: '#141414', border: '1px solid #222',
                    color: filters.page === 1 ? '#2a2a2a' : '#888',
                    cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                  }}>
                  Previous
                </button>
                <span className="text-[0.74rem]" style={{ color: '#3a3a3a' }}>
                  {filters.page} / {totalPages}
                </span>
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 rounded-lg text-[0.74rem] font-medium"
                  style={{
                    background: '#141414', border: '1px solid #222',
                    color: filters.page === totalPages ? '#2a2a2a' : '#888',
                    cursor: filters.page === totalPages ? 'not-allowed' : 'pointer',
                  }}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #333; }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #222 transparent; }

        html::-webkit-scrollbar { width: 4px; }
        html::-webkit-scrollbar-track { background: #0a0a0a; }
        html::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 999px; }
        html::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
        html { scrollbar-width: thin; scrollbar-color: #1e1e1e #0a0a0a; }
      `}</style>
    </div>
  );
}