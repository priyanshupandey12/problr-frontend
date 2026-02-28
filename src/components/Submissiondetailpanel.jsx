import { useEffect, useRef } from 'react';

const TECH_COLORS = [
  { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-900/40' },
  { bg: 'bg-blue-950/40',   text: 'text-blue-400',   border: 'border-blue-900/40'   },
  { bg: 'bg-emerald-950/40',text: 'text-emerald-400',border: 'border-emerald-900/40'},
  { bg: 'bg-violet-950/40', text: 'text-violet-400', border: 'border-violet-900/40' },
  { bg: 'bg-amber-950/40',  text: 'text-amber-400',  border: 'border-amber-900/40'  },
  { bg: 'bg-red-950/40',    text: 'text-red-400',    border: 'border-red-900/40'    },
  { bg: 'bg-pink-950/40',   text: 'text-pink-400',   border: 'border-pink-900/40'   },
  { bg: 'bg-cyan-950/40',   text: 'text-cyan-400',   border: 'border-cyan-900/40'   },
];

export default function SubmissionDetailPanel({
  submission,    
  isOpen,
  onClose,
  isOwner,         
  onVote,         
  onSelectWinner,   
  votingId,        
}) {
  const panelRef = useRef(null);


  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);


  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!submission) return null;

  const dev = typeof submission.developerId === 'object' ? submission.developerId : {};
  const voteCount = submission.votedBy?.length || 0;
  const isVoting = votingId === submission._id;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />


      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 h-full flex flex-col"
        style={{
          width: '420px',
          background: '#0f0f0f',
          borderLeft: '1px solid #1e1e1e',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1e1e1e #0f0f0f',
        }}
      >
    
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 sticky top-0 z-10"
          style={{ background: '#0f0f0f' }}>
          <div className="flex items-center gap-2">
            {submission.isWinner && (
              <span className="text-[0.62rem] font-bold px-2.5 py-1 rounded-full bg-amber-950/50 text-amber-400 border border-amber-900/50">
                🏆 Winner
              </span>
            )}
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-600">
              Submission Detail
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-600 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
          >
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>


        <div className="flex-1 px-6 py-5 flex flex-col gap-6">

   
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dev.profilePicture ? (
                <img src={dev.profilePicture} alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-blue-950 text-blue-400">
                  {dev.name?.charAt(0) || 'D'}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{dev.name || 'Anonymous'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {dev.wins > 0 && (
                    <span className="text-[0.6rem] text-amber-500">🏆 {dev.wins} wins</span>
                  )}
                  {dev.rating > 0 && (
                    <span className="text-[0.6rem] text-neutral-600">⭐ {dev.rating}</span>
                  )}
                  {dev.totalSubmissions > 0 && (
                    <span className="text-[0.6rem] text-neutral-700">
                      {dev.totalSubmissions} submissions
                    </span>
                  )}
                </div>
              </div>
            </div>


            <button
              onClick={() => onVote(submission._id)}
              disabled={isVoting}
              className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer disabled:opacity-50"
              style={{ background: 'transparent', borderColor: '#2a2a2a' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ff5c3a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            >
              {isVoting ? (
                <div className="w-3 h-3 rounded-full border border-neutral-600 border-t-white animate-spin" />
              ) : (
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="#ff5c3a" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
              <span className="text-xs font-bold text-white">{voteCount}</span>
            </button>
          </div>


          <div className="border-t border-neutral-900" />


          <div>
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-2">
              Solution Title
            </p>
            <h2 className="text-base font-bold text-white leading-snug">
              {submission.title}
            </h2>
          </div>


          <div>
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-2">
              How They Solved It
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {submission.description}
            </p>
          </div>

          {/* Tech Stack */}
          {submission.techStack?.length > 0 && (
            <div>
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-2">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {submission.techStack.map((tech, i) => {
                  const c = TECH_COLORS[i % TECH_COLORS.length];
                  return (
                    <span key={tech}
                      className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${c.bg} ${c.text} ${c.border}`}>
                      {tech}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features */}
          {submission.features?.length > 0 && (
            <div>
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-2">
                Key Features
              </p>
              <div className="flex flex-col gap-1.5">
                {submission.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#ff5c3a] mt-0.5 flex-shrink-0">→</span>
                    <span className="text-xs text-neutral-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div>
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-2">
              Links
            </p>
            <div className="flex flex-col gap-2">
              {submission.githubLink && (
                <a href={submission.githubLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all no-underline group">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span className="text-xs font-medium flex-1">GitHub Repository</span>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </a>
              )}
              {submission.liveLink && (
                <a href={submission.liveLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-emerald-400 hover:border-emerald-700 transition-all no-underline group">
                  <span>🔗</span>
                  <span className="text-xs font-medium flex-1">Live Demo</span>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </a>
              )}
              {submission.videoDemo && (
                <a href={submission.videoDemo} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:border-red-700 transition-all no-underline group">
                  <span>🎥</span>
                  <span className="text-xs font-medium flex-1">Video Demo</span>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-lg border border-neutral-900 bg-neutral-900/20 px-4 py-3 flex items-center justify-between">
            <span className="text-[0.65rem] text-neutral-600">Submitted</span>
            <span className="text-[0.65rem] font-medium text-neutral-500">
              {formatDate(submission.createdAt)}
            </span>
          </div>

        </div>

        {/* ── Footer — Select Winner (sirf poster ko) ── */}
        {isOwner && !submission.isWinner && (
          <div className="px-6 py-4 border-t border-neutral-900 sticky bottom-0"
            style={{ background: '#0f0f0f' }}>
            <button
              onClick={() => onSelectWinner(submission._id)}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer border-0 transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ff5c3a, #ff8c3a)' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              🏆 Select as Winner
            </button>
            <p className="text-[0.6rem] text-neutral-700 text-center mt-2">
              Yeh action permanent hai — winner change nahi hoga
            </p>
          </div>
        )}

        {isOwner && submission.isWinner && (
          <div className="px-6 py-4 border-t border-neutral-900"
            style={{ background: '#0f0f0f' }}>
            <div className="w-full py-3 rounded-xl text-sm font-bold text-amber-400 text-center border border-amber-900/40 bg-amber-950/20">
              🏆 This is the Winner
            </div>
          </div>
        )}

      </div>
    </>
  );
}