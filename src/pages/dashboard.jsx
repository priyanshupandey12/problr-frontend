import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { userAPI, problemAPI, submissionAPI } from '../utils/api';

const TECH_COLORS = [
  { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-900/40' },
  { bg: 'bg-blue-950/40',   text: 'text-blue-400',   border: 'border-blue-900/40'   },
  { bg: 'bg-emerald-950/40',text: 'text-emerald-400',border: 'border-emerald-900/40'},
  { bg: 'bg-violet-950/40', text: 'text-violet-400', border: 'border-violet-900/40' },
  { bg: 'bg-amber-950/40',  text: 'text-amber-400',  border: 'border-amber-900/40'  },
];

const STATUS_META = {
  open:       { label: 'Open',       color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-900/40', dot: '#34d399' },
  in_review:  { label: 'In Review',  color: 'text-blue-400',    bg: 'bg-blue-950/40',    border: 'border-blue-900/40',    dot: '#60a5fa' },
  solved:     { label: 'Solved',     color: 'text-amber-400',   bg: 'bg-amber-950/40',   border: 'border-amber-900/40',   dot: '#fbbf24' },
  closed:     { label: 'Closed',     color: 'text-neutral-500', bg: 'bg-neutral-900',    border: 'border-neutral-800',    dot: '#525252' },
  submitted:  { label: 'Submitted',  color: 'text-blue-400',    bg: 'bg-blue-950/40',    border: 'border-blue-900/40',    dot: '#60a5fa' },
  accepted:   { label: 'Accepted',   color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-900/40', dot: '#34d399' },
  rejected:   { label: 'Rejected',   color: 'text-red-400',     bg: 'bg-red-950/40',     border: 'border-red-900/40',     dot: '#f87171' },
};

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="rounded-xl border border-neutral-800 px-5 py-4 flex flex-col gap-1"
      style={{ background: accent ? 'rgba(255,92,58,0.06)' : '#111111', borderColor: accent ? 'rgba(255,92,58,0.2)' : '#1e1e1e' }}>
      <p className="text-[0.6rem] font-bold tracking-widest uppercase"
        style={{ color: accent ? '#ff5c3a' : '#555' }}>{label}</p>
      <p className="text-2xl font-black" style={{ color: accent ? '#ff5c3a' : '#f0f0f5' }}>{value}</p>
      {sub && <p className="text-[0.65rem] text-neutral-600">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [user, setUser]             = useState(null);
  const [problems, setProblems]     = useState([]);
  const [problemStats, setProblemStats] = useState(null);
  const [submissions, setSubmissions]   = useState([]);
  const [subStats, setSubStats]     = useState(null);
  const [activeTab, setActiveTab]   = useState('problems');
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [userData, problemData, subData] = await Promise.all([
        userAPI.getCurrentUser(token),
        problemAPI.getMyProblems(token),
        submissionAPI.getMySubmissions(token),
      ]);
      setUser(userData.user);
      setProblems(problemData.problems || []);
      setProblemStats(problemData.stats);
      setSubmissions(subData.submissions || []);
      setSubStats(subData.stats);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    if (days < 0) return { label: 'Expired', urgent: true };
    if (days === 0) return { label: 'Today', urgent: true };
    return { label: `${days}d left`, urgent: days <= 3 };
  };

  const joinedAgo = (date) => {
    const months = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24 * 30));
    if (months === 0) return 'Joined this month';
    if (months === 1) return 'Joined 1 month ago';
    return `Joined ${months} months ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-neutral-800 border-t-[#ff5c3a] animate-spin" />
        <p className="text-xs text-neutral-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const tabs = [
    { key: 'problems',    label: 'My Problems',    count: problemStats?.total || 0 },
    { key: 'submissions', label: 'My Submissions',  count: subStats?.total || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[76px]">
      <style>{`
        html::-webkit-scrollbar { width: 4px; }
        html::-webkit-scrollbar-track { background: #0a0a0a; }
        html::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 999px; }
        html { scrollbar-width: thin; scrollbar-color: #1e1e1e #0a0a0a; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-6 items-start">

          
          <div className="flex-shrink-0 flex flex-col gap-4" style={{ width: '280px' }}>

     
            <div className="rounded-xl border border-neutral-800 overflow-hidden" style={{ background: '#111111' }}>
   
              <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg, #1a0f0a, #0f1a1a, #0a0f1a)' }} />

              <div className="px-5 pb-5">
        
                <div className="relative -mt-8 mb-3">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt=""
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#111111]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-2 border-[#111111]"
                      style={{ background: '#ff5c3a', color: '#fff' }}>
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <h2 className="text-base font-bold text-white mb-0.5">{user.name}</h2>
                <p className="text-[0.65rem] text-neutral-600 mb-1">{user.email}</p>

    

                {user.bio && (
                  <p className="text-xs text-neutral-500 leading-relaxed mb-3">{user.bio}</p>
                )}

                <p className="text-[0.6rem] text-neutral-700 mb-3">{joinedAgo(user.createdAt)}</p>

                {/* Social Links */}
                <div className="flex flex-col gap-1.5">
                  {user.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-[0.68rem] text-neutral-600 hover:text-white transition-colors no-underline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-[0.68rem] text-neutral-600 hover:text-white transition-colors no-underline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a href={user.websiteUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-[0.68rem] text-neutral-600 hover:text-white transition-colors no-underline">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

    
   

        
            <div className="rounded-xl border border-neutral-800 px-5 py-4" style={{ background: '#111111' }}>
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-3">Stats</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Total Submissions', value: user.totalSubmissions || 0 },
                  { label: 'Problems Posted',   value: user.totalProblemsPosted || 0 },
                  { label: 'Wins',              value: user.wins || 0 },
                  { label: 'Rating',            value: user.rating ? `⭐ ${user.rating}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">{label}</span>
                    <span className="text-xs font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

        
            {/* <button
              onClick={() => navigate('/profile/edit')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-neutral-400 cursor-pointer transition-all border border-neutral-800 hover:border-neutral-600 hover:text-white"
              style={{ background: 'transparent' }}
            >
              ✏️ Edit Profile
            </button> */}

          </div>

    
          <div className="flex-1 min-w-0">

            <div className="grid grid-cols-4 gap-3 mb-6">
              {activeTab === 'problems' && problemStats ? (
                <>
                  <StatCard label="Total Problems" value={problemStats.total} />
                  <StatCard label="In Review"      value={problemStats.inReview} />
                  <StatCard label="Solved"         value={problemStats.solved} />
                  <StatCard label="Posts Left"     value={problemStats.remainingPostsThisMonth} sub="this month" accent />
                </>
              ) : subStats ? (
                <>
                  <StatCard label="Total"     value={subStats.total} />
                  <StatCard label="Submitted" value={subStats.submitted} />
                  <StatCard label="Accepted"  value={subStats.accepted} />
                  <StatCard label="Wins"      value={subStats.won} accent />
                </>
              ) : null}
            </div>

       
            <div className="flex rounded-lg overflow-hidden border border-neutral-800 mb-6"
              style={{ background: '#161616' }}>
              {tabs.map(tab => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer border-0 flex items-center justify-center gap-2
                    ${activeTab === tab.key ? 'bg-neutral-800 text-white' : 'bg-transparent text-neutral-600 hover:text-neutral-400'}`}>
                  {tab.label}
                  <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold
                    ${activeTab === tab.key ? 'bg-neutral-700 text-white' : 'bg-neutral-900 text-neutral-600'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

        
            {activeTab === 'problems' && (
              <div className="flex flex-col gap-3">
                {problems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="text-3xl">📋</span>
                    <p className="text-sm text-neutral-600">No problems posted yet</p>
                  </div>
                ) : problems.map(problem => {
                  const sm = STATUS_META[problem.status] || STATUS_META.open;
                  const dl = getDaysLeft(problem.deadline);
                  return (
                    <div key={problem._id}
                      onClick={() => navigate(`/problems/${problem._id}`)}
                      className="rounded-xl p-5 border border-neutral-900 cursor-pointer transition-all duration-150 hover:border-neutral-700 group"
                      style={{ background: '#111111' }}>

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[0.62rem] font-bold px-2 py-0.5 rounded-md border ${sm.bg} ${sm.color} ${sm.border}`}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 mb-px" style={{ background: sm.dot }} />
                            {sm.label}
                          </span>
                          <span className={`text-[0.62rem] font-semibold px-2 py-0.5 rounded-md border
                            ${dl.urgent ? 'bg-red-950/40 text-[#ff5c3a] border-red-900/40' : 'bg-neutral-900 text-neutral-500 border-neutral-800'}`}>
                            📅 {dl.label}
                          </span>
                        </div>
                        <span className="text-[0.6rem] text-neutral-700">{formatDate(problem.createdAt)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-[#ff5c3a] transition-colors">
                        {problem.title}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                        {problem.description?.length > 120
                          ? `${problem.description.substring(0, 120)}...`
                          : problem.description}
                      </p>

                      <div className="flex items-center gap-4 pt-3 border-t border-neutral-900">
                        <span className="text-[0.68rem] text-neutral-600">
                          📝 {problem.submissionCount ?? problem.submissions?.length ?? 0} submissions
                        </span>
                        <span className="text-[0.68rem] text-neutral-600">
                          👁 {problem.views || 0} views
                        </span>
                        <span className="text-[0.68rem] text-neutral-600">
                          ▲ {problem.upvotes || 0} upvotes
                        </span>
                        {problem.hasWinner && (
                          <span className="text-[0.68rem] text-amber-500 ml-auto">🏆 Winner selected</span>
                        )}
                        {!problem.hasWinner && problem.status === 'in_review' && (
                          <span className="text-[0.68rem] text-[#ff5c3a] ml-auto animate-pulse">
                            ⚡ Winner pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

       
            {activeTab === 'submissions' && (
              <div className="flex flex-col gap-3">
                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="text-3xl">🛠️</span>
                    <p className="text-sm text-neutral-600">No submissions yet</p>
                    <button onClick={() => navigate('/problems')}
                      className="text-xs font-bold px-5 py-2 rounded-full text-white cursor-pointer border-0"
                      style={{ background: '#ff5c3a' }}>
                      Browse Problems
                    </button>
                  </div>
                ) : submissions.map(sub => {
                  const sm = STATUS_META[sub.status] || STATUS_META.submitted;
                  const problem = sub.problemId || {};
                  const pdl = problem.deadline ? getDaysLeft(problem.deadline) : null;
                  return (
                    <div key={sub._id}
                      onClick={() => navigate(`/problems/${problem._id}`)}
                      className="rounded-xl p-5 border border-neutral-900 cursor-pointer transition-all duration-150 hover:border-neutral-700 group"
                      style={{ background: '#111111', borderLeft: sub.isWinner ? '3px solid #fbbf24' : undefined }}>

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {sub.isWinner && (
                            <span className="text-[0.62rem] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/50 text-amber-400 border border-amber-900/50">
                              🏆 Winner
                            </span>
                          )}
                          <span className={`text-[0.62rem] font-bold px-2 py-0.5 rounded-md border ${sm.bg} ${sm.color} ${sm.border}`}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 mb-px" style={{ background: sm.dot }} />
                            {sm.label}
                          </span>
                        </div>
                        <span className="text-[0.6rem] text-neutral-700">{formatDate(sub.createdAt)}</span>
                      </div>

                 
                      <h3 className="text-sm font-bold text-white mb-1 leading-snug group-hover:text-[#ff5c3a] transition-colors">
                        {sub.title}
                      </h3>

                 
                      {problem.title && (
                        <p className="text-[0.68rem] text-neutral-600 mb-3 flex items-center gap-1">
                          <span style={{ color: '#ff5c3a' }}>→</span>
                          {problem.title}
                          {pdl && (
                            <span className={`ml-2 ${pdl.urgent ? 'text-[#ff5c3a]' : 'text-neutral-700'}`}>
                              · {pdl.label}
                            </span>
                          )}
                        </p>
                      )}

                 
                      {sub.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {sub.techStack.slice(0, 5).map((tech, i) => {
                            const c = TECH_COLORS[i % TECH_COLORS.length];
                            return (
                              <span key={tech}
                                className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-md border ${c.bg} ${c.text} ${c.border}`}>
                                {tech}
                              </span>
                            );
                          })}
                          {sub.techStack.length > 5 && (
                            <span className="text-[0.6rem] text-neutral-600 px-2 py-0.5">
                              +{sub.techStack.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-3 border-t border-neutral-900">
                        <span className="text-[0.68rem] text-neutral-600">
                          ▲ {sub.votedBy?.length || 0} votes
                        </span>
                        {sub.githubLink && (
                          <a href={sub.githubLink} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[0.68rem] text-neutral-600 hover:text-white transition-colors no-underline flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                            GitHub
                          </a>
                        )}
                        {sub.liveLink && (
                          <a href={sub.liveLink} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[0.68rem] text-emerald-500 hover:text-emerald-400 transition-colors no-underline">
                            🔗 Live
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}