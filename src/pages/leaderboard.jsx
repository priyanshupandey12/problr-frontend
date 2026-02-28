import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';

const PERIOD_OPTIONS = [
  { label: 'All Time',   value: 'all'   },
  { label: 'This Month', value: 'month' },
  { label: 'This Week',  value: 'week'  },
];

const RANK_STYLES = {
  1: { bg: '#1a1400', border: 'rgba(251,191,36,0.25)',  text: '#fbbf24' },
  2: { bg: '#141414', border: 'rgba(156,163,175,0.2)',  text: '#9ca3af' },
  3: { bg: '#1a0f00', border: 'rgba(251,146,60,0.2)',   text: '#fb923c' },
};

const Icons = {
  Trophy: ({ size = 13, color = 'currentColor' }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M12 17v4M8 21h8M12 17a5 5 0 005-5V4H7v8a5 5 0 005 5z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronUp: ({ size = 11 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  FileText: ({ size = 11 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

// Rank badge SVG
function RankBadge({ rank, size = 20 }) {
  const colors = { 1: '#fbbf24', 2: '#9ca3af', 3: '#fb923c' };
  const color  = colors[rank] || '#555';
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="14" r="7" stroke={color} strokeWidth="1.5"/>
      <path d="M9 8.5L12 3l3 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="12" y="18" textAnchor="middle" fill={color} fontSize="7" fontWeight="bold">{rank}</text>
    </svg>
  );
}

function ScoreBar({ score, maxScore }) {
  const pct = maxScore > 0 ? Math.max(4, (score / maxScore) * 100) : 4;
  return (
    <div className="w-full h-[3px] rounded-full bg-neutral-900 overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ff5c3a, #ff8c3a)' }} />
    </div>
  );
}

function Avatar({ src, name, size = 'md', borderColor }) {
  const cls = {
    lg: 'w-14 h-14 text-base',
    md: 'w-9 h-9 text-xs',
    sm: 'w-7 h-7 text-[0.6rem]',
  }[size] || 'w-9 h-9 text-xs';

  const style = borderColor
    ? { border: `2px solid ${borderColor}` }
    : { border: '1px solid rgba(255,92,58,0.2)' };

  if (src) return (
    <img src={src} alt="" className={`${cls} rounded-full object-cover flex-shrink-0`} style={style} />
  );
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-black flex-shrink-0`}
      style={{ background: 'rgba(255,92,58,0.1)', color: '#ff5c3a', ...style }}>
      {name?.charAt(0)}
    </div>
  );
}

function PodiumCard({ dev, isCenter }) {
  if (!dev) return <div />;
  const rs = RANK_STYLES[dev.rank] || {};

  return (
    <div className={`flex flex-col items-center rounded-2xl border p-3 sm:p-4 ${isCenter ? 'py-5 sm:py-7' : 'py-4'}`}
      style={{ background: rs.bg, borderColor: rs.border }}>

      <RankBadge rank={dev.rank} size={isCenter ? 22 : 18} />

      <div className="my-3">
        <Avatar src={dev.profilePicture} name={dev.name} size={isCenter ? 'lg' : 'md'} borderColor={rs.text} />
      </div>

      <p className={`font-bold text-white text-center leading-tight w-full px-1 truncate ${isCenter ? 'text-sm' : 'text-xs'}`}>
        {dev.name}
      </p>

      <p className={`font-black mt-1 mb-3 ${isCenter ? 'text-base' : 'text-sm'}`} style={{ color: rs.text }}>
        {dev.score} <span className="text-[0.6rem] font-bold">pts</span>
      </p>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-[0.58rem] text-neutral-600">
          <Icons.Trophy size={9} color="#9ca3af" /> {dev.wins}
        </span>
        <span className="flex items-center gap-1 text-[0.58rem] text-neutral-600">
          <Icons.ChevronUp size={9} /> {dev.totalVotes}
        </span>
        <span className="flex items-center gap-1 text-[0.58rem] text-neutral-600">
          <Icons.FileText size={9} /> {dev.totalSubmissions}
        </span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [period,      setPeriod]      = useState('all');

  useEffect(() => { fetchLeaderboard(); }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getLeaderboard(period);
      setLeaderboard(res.leaderboard || []);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxScore = leaderboard[0]?.score || 1;
  const top3     = leaderboard.slice(0, 3);
  const rest     = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[76px]">
      <style>{`
        html::-webkit-scrollbar { width: 4px; }
        html::-webkit-scrollbar-track { background: #0a0a0a; }
        html::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 999px; }
        html { scrollbar-width: thin; scrollbar-color: #1e1e1e #0a0a0a; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[0.6rem] font-bold tracking-widest uppercase mb-2" style={{ color: '#ff5c3a' }}>
            Community
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            Leaderboard
          </h1>
          <p className="text-xs text-neutral-600">Top developers ranked by wins, votes, and submissions</p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex rounded-xl border border-neutral-800 p-1 gap-1" style={{ background: '#111111' }}>
            {PERIOD_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPeriod(opt.value)}
                className={`px-4 sm:px-5 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer border-0 ${
                  period === opt.value
                    ? 'bg-neutral-800 text-white'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-400'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Score Formula */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
          {[
            { label: 'Win', value: '×10 pts' },
            { label: 'Vote', value: '×1 pt' },
            { label: 'Submission', value: '×1 pt' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800"
              style={{ background: '#111' }}>
              <span className="text-[0.65rem] font-bold text-white">{label}</span>
              <span className="text-[0.65rem] font-bold" style={{ color: '#ff5c3a' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-800 border-t-[#ff5c3a] animate-spin" />
            <p className="text-xs text-neutral-600">Loading...</p>
          </div>

        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border border-neutral-800"
              style={{ background: '#111' }}>
              <Icons.Trophy size={20} color="#3a3a3a" />
            </div>
            <p className="text-sm text-neutral-600">
              {period === 'all' ? 'No developers yet' : 'No activity in this period'}
            </p>
          </div>

        ) : (
          <>
            {/* ── Top 3 Podium ── */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                {[top3[1], top3[0], top3[2]].map((dev, idx) => (
                  <PodiumCard key={dev?.userId || idx} dev={dev} isCenter={idx === 1} />
                ))}
              </div>
            )}

            {/* ── Rest ── */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-1.5">

                {/* Desktop header */}
                <div className="hidden sm:grid items-center gap-4 px-4 pb-1"
                  style={{ gridTemplateColumns: '36px 1fr 64px 64px 64px 56px' }}>
                  {['#', 'Developer', 'Wins', 'Votes', 'Subs', 'Score'].map(h => (
                    <p key={h} className="text-[0.58rem] font-bold tracking-widest uppercase text-neutral-700">{h}</p>
                  ))}
                </div>

                {rest.map(dev => (
                  <div key={dev.userId}
                    className="rounded-xl border border-neutral-900 hover:border-neutral-700 transition-all group"
                    style={{ background: '#111111' }}>

                    {/* Desktop row */}
                    <div className="hidden sm:grid items-center gap-4 px-4 py-3.5"
                      style={{ gridTemplateColumns: '36px 1fr 64px 64px 64px 56px' }}>

                      <span className="text-xs font-black text-neutral-600">#{dev.rank}</span>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar src={dev.profilePicture} name={dev.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate group-hover:text-[#ff5c3a] transition-colors">
                            {dev.name}
                          </p>
                          <ScoreBar score={dev.score} maxScore={maxScore} />
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Icons.Trophy size={11} color="#fbbf24" /> {dev.wins}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Icons.ChevronUp size={11} /> {dev.totalVotes}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Icons.FileText size={11} /> {dev.totalSubmissions}
                      </span>
                      <span className="text-xs font-black" style={{ color: '#ff5c3a' }}>{dev.score}</span>
                    </div>

                    {/* Mobile row */}
                    <div className="sm:hidden flex items-center gap-3 px-4 py-3.5">
                      <span className="text-xs font-black text-neutral-600 w-6 flex-shrink-0 text-center">
                        #{dev.rank}
                      </span>
                      <Avatar src={dev.profilePicture} name={dev.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{dev.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[0.6rem] text-amber-400">
                            <Icons.Trophy size={9} color="#fbbf24" /> {dev.wins}
                          </span>
                          <span className="flex items-center gap-1 text-[0.6rem] text-neutral-600">
                            <Icons.ChevronUp size={9} /> {dev.totalVotes}
                          </span>
                          <span className="flex items-center gap-1 text-[0.6rem] text-neutral-600">
                            <Icons.FileText size={9} /> {dev.totalSubmissions}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black flex-shrink-0" style={{ color: '#ff5c3a' }}>
                        {dev.score}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}