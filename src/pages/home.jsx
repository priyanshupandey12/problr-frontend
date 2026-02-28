import { useState, useEffect } from 'react';
import { SignedOut, SignedIn, useClerk, useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { problemAPI, userAPI } from '../utils/api';

const Icons = {
  Arrow: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Chevron: () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clock: ({ size = 11 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Trophy: ({ size = 15 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M12 17v4M8 21h8M12 17a5 5 0 005-5V4H7v8a5 5 0 005 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Alert: ({ size = 15 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  FileText: ({ size = 11 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Users: ({ size = 15 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Check: ({ size = 15 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Zap: ({ size = 11 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Github: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  ),
};


const PAIN_META = {
  'safety-risk':        { label: 'Safety Risk',       color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)' },
  'stressful':          { label: 'Stressful',          color: '#ffaa44', bg: 'rgba(255,170,68,0.08)',  border: 'rgba(255,170,68,0.2)'  },
  'costs-money':        { label: 'Costs Money',        color: '#44aaff', bg: 'rgba(68,170,255,0.08)',  border: 'rgba(68,170,255,0.2)'  },
  'time-consuming':     { label: 'Time Consuming',     color: '#9a8fff', bg: 'rgba(154,143,255,0.08)', border: 'rgba(154,143,255,0.2)' },
  'mild-inconvenience': { label: 'Mild Inconvenience', color: '#44cc88', bg: 'rgba(68,204,136,0.08)',  border: 'rgba(68,204,136,0.2)'  },
};

const STEPS = [
  { num: '01', title: 'Post Your Problem',  desc: 'Describe a real problem you face daily. No solution framing — just the friction.' },
  { num: '02', title: 'Developers Build',   desc: 'Developers from the community pick it up and submit their solutions.' },
  { num: '03', title: 'Community Decides',  desc: 'Votes surface the best solution. You pick the winner.' },
];


function Footer() {
  return (
    <footer className="border-t border-neutral-900" style={{ background: '#0a0a0f' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-black text-white tracking-tight">TechPost</span>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-[200px]">
              Real problems. Real solutions.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-1">Platform</p>
            {[
              { label: 'Browse Problems', to: '/problems' },
              { label: 'Leaderboard',     to: '/leaderboard' },
              { label: 'Dashboard',       to: '/dashboard' },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="text-xs text-neutral-600 hover:text-white transition-colors no-underline w-fit">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-neutral-900 pt-6 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[0.65rem] text-neutral-700">© {new Date().getFullYear()} TechPost. All rights reserved.</p>
          <p className="text-[0.65rem] text-neutral-700">Built for real problems, not portfolio pieces.</p>
        </div>
      </div>
    </footer>
  );
}

function ProblemCard({ problem, onClick }) {
  const pm   = PAIN_META[problem.painLevel] || {};
  const days = Math.ceil((new Date(problem.deadline) - new Date()) / 86400000);
  const urgent   = days <= 3;
  const dlLabel  = days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d left`;

  return (
    <div onClick={onClick}
      className="rounded-xl p-5 border border-neutral-900 cursor-pointer transition-all duration-200 hover:border-neutral-700 group flex flex-col gap-3"
      style={{ background: '#111111' }}>

      <div className="flex items-center gap-2 flex-wrap">
        {pm.label && (
          <span className="text-[0.62rem] font-semibold px-2 py-0.5 rounded-md"
            style={{ background: pm.bg, color: pm.color, border: `1px solid ${pm.border}` }}>
            {pm.label}
          </span>
        )}
        <span className={`text-[0.62rem] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1
          ${urgent ? 'text-[#ff5c3a] border-red-900/40 bg-red-950/30' : 'text-neutral-600 border-neutral-800 bg-neutral-900'}`}>
          <Icons.Clock /> {dlLabel}
        </span>
      </div>

      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#ff5c3a] transition-colors flex-1">
        {problem.title}
      </h3>

      <p className="text-xs leading-relaxed text-neutral-600">
        {problem.description?.length > 110
          ? `${problem.description.substring(0, 110)}...`
          : problem.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
        <span className="text-[0.65rem] text-neutral-600 flex items-center gap-1">
          <Icons.FileText /> {problem.submissionCount ?? 0} submissions
        </span>
        <span className="text-[0.65rem] font-bold text-amber-500 flex items-center gap-1">
          <Icons.Zap /> {problem.priorityScore}/9
        </span>
      </div>
    </div>
  );
}


function SignedOutHome() {
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [topDevs,          setTopDevs]          = useState([]);
  const [stats,            setStats]            = useState({ problems: 0, submissions: 0, winners: 0, developers: 0 });
  const [loadingProblems,  setLoadingProblems]  = useState(true);
  const [loadingDevs,      setLoadingDevs]      = useState(true);

  useEffect(() => { fetchFeatured(); fetchTopDevs(); }, []);

  const fetchFeatured = async () => {
    try {
      const data = await problemAPI.getAllProblems({ sortBy: 'priority', limit: 3, page: 1 });
      setFeaturedProblems(data.problems || []);
      setStats(p => ({ ...p, problems: data.total || 0 }));
    } catch (e) { console.error(e); }
    finally { setLoadingProblems(false); }
  };

  const fetchTopDevs = async () => {
    try {
      const data = await userAPI.getLeaderboard('all');
      const top  = (data.leaderboard || []).slice(0, 5);
      setTopDevs(top);
      setStats(p => ({
        ...p,
        submissions: top.reduce((a, d) => a + d.totalSubmissions, 0),
        winners:     top.reduce((a, d) => a + d.wins, 0),
        developers:  data.count || 0,
      }));
    } catch (e) { console.error(e); }
    finally { setLoadingDevs(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">


        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center text-center pt-24 pb-20 gap-5">
            <span className="text-[0.65rem] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border w-fit"
              style={{ color: '#555', borderColor: '#222', background: '#0a0a0f' }}>
              Build Real. Ship Real.
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold"
              style={{ color: '#fff', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
              Stop cloning.{' '}
              <span style={{ color: '#ff5c3a', fontStyle: 'italic' }}>Start solving.</span>
            </h1>

            <p className="text-sm sm:text-base max-w-lg text-neutral-500" style={{ lineHeight: '1.6' }}>
              Post a problem you face daily — developers pick it up, build it, and ship it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button onClick={() => openSignIn()}
                className="px-7 py-3 font-semibold rounded-xl text-sm transition-opacity hover:opacity-80 cursor-pointer border-0"
                style={{ background: '#ff5c3a', color: '#fff' }}>
                Post a Problem
              </button>
              <button onClick={() => navigate('/problems')}
                className="px-7 py-3 font-semibold rounded-xl text-sm border transition-colors hover:border-white cursor-pointer bg-transparent"
                style={{ color: '#fff', borderColor: '#2a2a2a' }}>
                Browse Problems
              </button>
            </div>

            <p className="text-xs text-neutral-700">No clones. No tutorials. Just real-world impact.</p>
          </div>
        </section>

   
        <section className="border-y border-neutral-900" style={{ background: '#0a0a0f' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { label: 'Problems Posted',     value: stats.problems,    I: Icons.FileText },
                { label: 'Solutions Submitted', value: stats.submissions, I: Icons.Check    },
                { label: 'Winners Selected',    value: stats.winners,     I: Icons.Trophy   },
                { label: 'Active Developers',   value: stats.developers,  I: Icons.Users    },
              ].map(({ label, value, I }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-800"
                    style={{ background: '#161616', color: '#ff5c3a' }}>
                    <I size={15} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
                  <p className="text-[0.65rem] text-neutral-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

    
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-[#ff5c3a] mb-1">Featured</p>
              <h2 className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                High Priority Problems
              </h2>
            </div>
            <button onClick={() => navigate('/problems')}
              className="text-xs font-semibold text-neutral-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 flex items-center gap-1">
              View all <Icons.Chevron />
            </button>
          </div>

          {loadingProblems ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="rounded-xl border border-neutral-900 animate-pulse" style={{ background: '#111', height: '190px' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProblems.map(p => (
                <ProblemCard key={p._id} problem={p} onClick={() => navigate(`/problems/${p._id}`)} />
              ))}
            </div>
          )}
        </section>

     
        <section className="border-y border-neutral-900" style={{ background: '#0a0a0f' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-10">
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-[#ff5c3a] mb-1">Process</p>
              <h2 className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>How It Works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STEPS.map(step => (
                <div key={step.num} className="flex flex-col gap-3 p-6 rounded-xl border border-neutral-900" style={{ background: '#111111' }}>
                  <span className="text-[0.7rem] font-black tracking-widest text-[#ff5c3a]">{step.num}</span>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-[#ff5c3a] mb-1">Community</p>
              <h2 className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>Top Developers</h2>
            </div>
            <button onClick={() => navigate('/leaderboard')}
              className="text-xs font-semibold text-neutral-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 flex items-center gap-1">
              Full leaderboard <Icons.Chevron />
            </button>
          </div>

          {loadingDevs ? (
            <div className="flex flex-col gap-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl border border-neutral-900 animate-pulse" style={{ background: '#0a0a0f' }} />)}
            </div>
          ) : topDevs.length === 0 ? (
            <p className="text-sm text-neutral-600 text-center py-8">No developers yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topDevs.map(dev => (
                <div key={dev.userId}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-xl border border-neutral-900 hover:border-neutral-700 transition-all"
                  style={{ background: '#0a0a0f' }}>
                  <span className="text-xs font-black w-6 text-center flex-shrink-0 text-neutral-600">
                    #{dev.rank}
                  </span>
                  {dev.profilePicture ? (
                    <img src={dev.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(255,92,58,0.1)', color: '#ff5c3a', border: '1px solid rgba(255,92,58,0.2)' }}>
                      {dev.name?.charAt(0)}
                    </div>
                  )}
                  <p className="text-sm font-bold text-white flex-1 truncate">{dev.name}</p>
                  <div className="hidden sm:flex items-center gap-5">
                    <span className="text-xs text-neutral-600 flex items-center gap-1.5">
                      <Icons.Trophy size={11} /> {dev.wins} wins
                    </span>
                    <span className="text-xs text-neutral-600 flex items-center gap-1.5">
                      <Icons.FileText size={11} /> {dev.totalSubmissions} submissions
                    </span>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{ color: '#ff5c3a' }}>
                    {dev.score} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

  

      </div>
      <Footer />
    </div>
  );
}


function SignedInHome() {
  const navigate     = useNavigate();
  const { user }     = useUser();
  const { getToken } = useAuth();

  const [latestProblems, setLatestProblems] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [loadingLatest,  setLoadingLatest]  = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  useEffect(() => { fetchLatest(); fetchPending(); }, []);

  const fetchLatest = async () => {
    try {
      const data = await problemAPI.getAllProblems({ sortBy: 'recent', limit: 6, page: 1 });
      setLatestProblems(data.problems || []);
    } catch (e) { console.error(e); }
    finally { setLoadingLatest(false); }
  };

  const fetchPending = async () => {
    try {
      const token = await getToken();
      const data  = await problemAPI.getMyProblems(token);
      const actions = [];

      (data.problems || []).forEach(p => {
        const expired  = new Date(p.deadline) < new Date();
        const subCount = p.submissionCount ?? p.submissions?.length ?? 0;

        if (expired && !p.selectedWinner && subCount > 0) {
          actions.push({
            type:      'select-winner',
            problemId: p._id,
            title:     p.title,
            message:   'Deadline nikal gayi — winner select karo',
            count:     subCount,
          });
        }

        if (!expired && subCount === 0) {
          actions.push({
            type:      'no-submissions',
            problemId: p._id,
            title:     p.title,
            message:   'Koi submission nahi aayi abhi tak',
            daysLeft:  Math.ceil((new Date(p.deadline) - new Date()) / 86400000),
          });
        }
      });

      setPendingActions(actions);
    } catch (e) { console.error(e); }
    finally { setLoadingPending(false); }
  };

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col min-h-screen pt-[76px]">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">


          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
              Welcome back, {firstName}.
            </h1>
          </div>

     
          {!loadingPending && pendingActions.length > 0 && (
            <div className="mb-10">
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-600 mb-3">
                Action Required
              </p>
              <div className="flex flex-col gap-2">
                {pendingActions.map((action, idx) => (
                  <div key={idx}
                    onClick={() => navigate(`/problems/${action.problemId}`)}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all hover:border-neutral-600"
                    style={{
                      background:   action.type === 'select-winner' ? 'rgba(255,92,58,0.04)' : '#111111',
                      borderColor:  action.type === 'select-winner' ? 'rgba(255,92,58,0.2)'  : '#1e1e1e',
                    }}>

                    <div className="flex-shrink-0"
                      style={{ color: action.type === 'select-winner' ? '#ff5c3a' : '#555' }}>
                      {action.type === 'select-winner'
                        ? <Icons.Trophy size={15} />
                        : <Icons.Alert  size={15} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{action.title}</p>
                      <p className="text-[0.65rem] text-neutral-600 mt-0.5">{action.message}</p>
                    </div>

                    {action.type === 'select-winner' && (
                      <span className="text-[0.62rem] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(255,92,58,0.1)', color: '#ff5c3a', border: '1px solid rgba(255,92,58,0.2)' }}>
                        {action.count} submissions
                      </span>
                    )}

                    {action.type === 'no-submissions' && (
                      <span className="text-[0.62rem] text-neutral-600 flex-shrink-0 flex items-center gap-1">
                        <Icons.Clock size={10} /> {action.daysLeft}d left
                      </span>
                    )}

                    <Icons.Chevron />
                  </div>
                ))}
              </div>
            </div>
          )}

     
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-600 mb-1">Explore</p>
                <h2 className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                  Latest Problems
                </h2>
              </div>
              <button onClick={() => navigate('/problems')}
                className="text-xs font-semibold text-neutral-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 flex items-center gap-1">
                View all <Icons.Chevron />
              </button>
            </div>

            {loadingLatest ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="rounded-xl border border-neutral-900 animate-pulse" style={{ background: '#111', height: '190px' }} />
                ))}
              </div>
            ) : latestProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-neutral-900" style={{ background: '#0a0a0f' }}>
                <p className="text-sm text-neutral-600">No problems posted yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestProblems.map(p => (
                  <ProblemCard key={p._id} problem={p} onClick={() => navigate(`/problems/${p._id}`)} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}


export default function Home() {
  return (
    <>
      <SignedOut><SignedOutHome /></SignedOut>
      <SignedIn><SignedInHome /></SignedIn>
    </>
  );
}