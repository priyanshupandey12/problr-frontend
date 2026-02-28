import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemAPI, submissionAPI } from '../utils/api';
import SubmissionModal from '../components/submissionModal';
import { useAuth } from "@clerk/clerk-react";
import SubmissionDetailPanel from '../components/SubmissionDetailPanel';

const PAIN_META = {
  'safety-risk':        { label: 'Safety Risk',       bgClass: 'bg-red-950/60',    textClass: 'text-red-400',    borderClass: 'border-red-900/60'    },
  'stressful':          { label: 'Stressful',          bgClass: 'bg-orange-950/60', textClass: 'text-orange-400', borderClass: 'border-orange-900/60' },
  'costs-money':        { label: 'Costs Money',        bgClass: 'bg-blue-950/60',   textClass: 'text-blue-400',   borderClass: 'border-blue-900/60'   },
  'time-consuming':     { label: 'Time Consuming',     bgClass: 'bg-violet-950/60', textClass: 'text-violet-400', borderClass: 'border-violet-900/60' },
  'mild-inconvenience': { label: 'Mild Inconvenience', bgClass: 'bg-green-950/60',  textClass: 'text-green-400',  borderClass: 'border-green-900/60'  },
};

const FREQ_META = {
  'daily':            { label: 'Daily',           textClass: 'text-blue-400',   bgClass: 'bg-blue-950/50',   borderClass: 'border-blue-900/50'   },
  'weekly':           { label: 'Weekly',          textClass: 'text-indigo-400', bgClass: 'bg-indigo-950/50', borderClass: 'border-indigo-900/50' },
  'monthly':          { label: 'Monthly',         textClass: 'text-emerald-400',bgClass: 'bg-emerald-950/50',borderClass: 'border-emerald-900/50'},
  'rare-but-serious': { label: 'Rare but Serious',textClass: 'text-purple-400', bgClass: 'bg-purple-950/50', borderClass: 'border-purple-900/50' },
};

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

function Tag({ children, bgClass = 'bg-neutral-900', textClass = 'text-neutral-400', borderClass = 'border-neutral-800' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${bgClass} ${textClass} ${borderClass}`}>
      {children}
    </span>
  );
}

function DescriptionEdit({ problem, getToken, isOwner, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(problem.description);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    if (value.trim().length < 50) { setError(`${50 - value.trim().length} more characters needed`); return; }
    if (problem.submissions?.length > 0) { setError('Submissions aa jaane ke baad description nahi badal sakte'); return; }
    setSaving(true); setError('');
    try {
      const token = await getToken();
      await problemAPI.updateProblem(token, problem._id, { description: value });
      onUpdate(value); setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.details?.[0] || err.message || 'Update nahi ho payi');
    } finally { setSaving(false); }
  };

  const handleCancel = () => { setValue(problem.description); setEditing(false); setError(''); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700">Description</p>
        {!editing && isOwner && problem.submissions?.length === 0 && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[0.6rem] font-medium text-neutral-600 hover:text-white transition-colors cursor-pointer bg-transparent border-0 px-0">
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Edit
          </button>
        )}
      </div>
      {!editing ? (
        <p className="text-sm text-neutral-400 leading-relaxed">{problem.description}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea value={value} onChange={e => { setValue(e.target.value); setError(''); }}
            rows={5} maxLength={500}
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-[#ff5c3a] transition-colors"
            placeholder="Describe the problem..." autoFocus />
          <div className="flex items-center justify-between">
            <p className={`text-[0.6rem] ${error ? 'text-red-500' : 'text-neutral-700'}`}>
              {error || (value.trim().length < 50 ? `${50 - value.trim().length} more chars needed` : '✓ Looks good')}
            </p>
            <p className="text-[0.6rem] text-neutral-700">{value.length}/500</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white cursor-pointer border-0 disabled:opacity-50 transition-all"
              style={{ background: '#ff5c3a' }}
              onMouseEnter={e => !saving && (e.currentTarget.style.background = '#ff4422')}
              onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}>
              {saving ? <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" /> : 'Save'}
            </button>
            <button onClick={handleCancel}
              className="text-xs font-medium px-4 py-2 rounded-full text-neutral-500 hover:text-white transition-colors cursor-pointer bg-transparent border border-neutral-800 hover:border-neutral-600">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DeadlineExtend({ problem, getToken, isOwner, onUpdate }) {
  const [open, setOpen]     = useState(false);
  const [value, setValue]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const minDate = new Date(problem.deadline);
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSave = async () => {
    if (!value) { setError('Date select karo'); return; }
    setSaving(true); setError('');
    try {
      const token = await getToken();
      await problemAPI.updateProblem(token, problem._id, { deadline: value });
      onUpdate(value); setOpen(false); setValue('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Update nahi ho payi');
    } finally { setSaving(false); }
  };

  if (!isOwner) return null;

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-[0.6rem] font-medium text-neutral-700 hover:text-[#ff5c3a] transition-colors cursor-pointer bg-transparent border-0 px-0">
          <svg width="9" height="9" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Extend Deadline
        </button>
      ) : (
        <div className="flex flex-col gap-2 pt-1">
          <input type="date" value={value} min={minDateStr}
            onChange={e => { setValue(e.target.value); setError(''); }}
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c3a] transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }} />
          {error && <p className="text-[0.6rem] text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center text-xs font-bold py-2 rounded-lg text-white cursor-pointer border-0 disabled:opacity-50"
              style={{ background: '#ff5c3a' }}
              onMouseEnter={e => !saving && (e.currentTarget.style.background = '#ff4422')}
              onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}>
              {saving ? <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" /> : 'Extend'}
            </button>
            <button onClick={() => { setOpen(false); setValue(''); setError(''); }}
              className="flex-1 text-xs font-medium py-2 rounded-lg text-neutral-500 hover:text-white cursor-pointer bg-transparent border border-neutral-800">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProblemDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { getToken, userId } = useAuth();

  const [problem,            setProblem]           = useState(null);
  const [loading,            setLoading]           = useState(true);
  const [activeTab,          setActiveTab]         = useState('problem');
  const [modalOpen,          setModalOpen]         = useState(false);
  const [submissions,        setSubmissions]       = useState([]);
  const [selectedSubmission, setSelectedSubmission]= useState(null);
  const [panelOpen,          setPanelOpen]         = useState(false);
  const [votingId,           setVotingId]          = useState(null);

  useEffect(() => { fetchProblem(); }, [id]);

  const fetchProblem = async () => {
    setLoading(true);
    try {
      const data = await problemAPI.getProblemById(id);
      setProblem(data.problem);
      setSubmissions(data.problem.submissions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleVote = async (submissionId) => {
    setVotingId(submissionId);
    try {
      const token = await getToken();
      const res   = await submissionAPI.vote(token, submissionId);
      setSubmissions(prev => prev.map(sub =>
        sub._id === submissionId
          ? { ...sub, votedBy: res.hasVoted ? [...(sub.votedBy || []), 'me'] : (sub.votedBy || []).slice(0, -1) }
          : sub
      ));
    } catch (err) { console.error(err); }
    finally { setVotingId(null); }
  };

  const handleSelectWinner = async (submissionId) => {
    try {
      const token = await getToken();
      await submissionAPI.selectWinner(token, submissionId);
      await fetchProblem();
      setPanelOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (formData) => {
    const token = await getToken();
    const res   = await submissionAPI.create(token, { ...formData, problemId: id });
    setSubmissions(prev => [...prev, { ...res.submission, developerId: { name: 'You', profilePicture: null } }]);
    await fetchProblem();
    setActiveTab('submissions');
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    if (days < 0) return { label: 'Expired', urgent: true };
    if (days === 0) return { label: 'Today', urgent: true };
    if (days === 1) return { label: '1 day left', urgent: true };
    return { label: `${days} days left`, urgent: days <= 3 };
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-neutral-800 border-t-[#ff5c3a] animate-spin" />
        <p className="text-xs text-neutral-600">Loading problem...</p>
      </div>
    </div>
  );

  if (!problem) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-sm text-neutral-500">Problem not found</p>
        <button onClick={() => navigate('/problems')}
          className="text-xs font-semibold px-5 py-2 rounded-full bg-[#ff5c3a] text-white cursor-pointer border-0">
          Back to Problems
        </button>
      </div>
    </div>
  );

  const pm = PAIN_META[problem.painLevel] || {};
  const fm = FREQ_META[problem.frequency] || {};
  const { label: dlLabel, urgent } = getDaysLeft(problem.deadline);
  const hasWinner  = !!problem.selectedWinner;
  const isOwner    = userId === problem.postedBy?.clerkId;

  const statusLabel = { open: 'Open', in_review: 'In Review', solved: 'Solved', closed: 'Closed' }[problem.status] || problem.status;
  const statusColors = {
    open:      'bg-emerald-950/60 text-emerald-400 border-emerald-900/60',
    in_review: 'bg-blue-950/60 text-blue-400 border-blue-900/60',
    solved:    'bg-emerald-950/60 text-emerald-400 border-emerald-900/60',
    closed:    'bg-neutral-900 text-neutral-500 border-neutral-800',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[76px]">
      <style>{`
        html::-webkit-scrollbar { width: 4px; }
        html::-webkit-scrollbar-track { background: #0a0a0a; }
        html::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 999px; }
        html { scrollbar-width: thin; scrollbar-color: #1e1e1e #0a0a0a; }
        .sub-card { border-left: 3px solid transparent; transition: border-color 0.15s; }
        .sub-card:hover { border-left-color: #ff5c3a; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Back */}
        <button onClick={() => navigate('/problems')}
          className="flex items-center gap-2 mb-5 text-xs font-medium text-neutral-600 hover:text-[#ff5c3a] transition-colors bg-transparent border border-neutral-800 hover:border-neutral-700 rounded-full px-3 py-1.5 cursor-pointer">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Back to Problems
        </button>

        {/* ── Layout: mobile = column, desktop = row ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Tag bgClass="bg-indigo-950/50" textClass="text-indigo-400" borderClass="border-indigo-900/50">
                {problem.category}
              </Tag>
              {pm.label && (
                <Tag bgClass={pm.bgClass} textClass={pm.textClass} borderClass={pm.borderClass}>
                  {pm.label}
                </Tag>
              )}
              {fm.label && (
                <Tag bgClass={fm.bgClass} textClass={fm.textClass} borderClass={fm.borderClass}>
                  {fm.label}
                </Tag>
              )}
              <Tag
                bgClass={urgent ? 'bg-red-950/60' : 'bg-neutral-900'}
                textClass={urgent ? 'text-[#ff5c3a]' : 'text-neutral-500'}
                borderClass={urgent ? 'border-red-900/60' : 'border-neutral-800'}>
                {dlLabel}
              </Tag>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight mb-4"
              style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
              {problem.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap mb-6 pb-5 border-b border-neutral-900">
              {problem.postedBy?.profilePicture ? (
                <img src={problem.postedBy.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-[#ff5c3a] text-white">
                  {problem.postedBy?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-white">{problem.postedBy?.name || 'Anonymous'}</span>
              <span className="text-neutral-700">·</span>
              <span className="text-xs text-neutral-600">Posted {formatDate(problem.createdAt)}</span>
              <span className="text-neutral-700">·</span>
              <span className="text-xs text-neutral-600">{problem.views?.toLocaleString() || 0} views</span>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg overflow-hidden border border-neutral-800 mb-7" style={{ background: '#161616' }}>
              {[
                { key: 'problem',     label: 'Problem' },
                { key: 'submissions', label: `Submissions (${submissions.length})` },
                { key: 'discussion',  label: 'Discussion' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 text-[0.7rem] sm:text-xs font-semibold transition-all duration-150 cursor-pointer border-0 ${
                    activeTab === tab.key ? 'bg-neutral-800 text-white' : 'bg-transparent text-neutral-600 hover:text-neutral-400'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Problem Tab ── */}
            {activeTab === 'problem' && (
              <div className="flex flex-col gap-7">
                <DescriptionEdit
                  problem={problem}
                  getToken={getToken}
                  isOwner={isOwner}
                  onUpdate={(newDesc) => setProblem(prev => ({ ...prev, description: newDesc }))}
                />

                {problem.desiredOutcome && (
                  <div>
                    <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-3">Desired Outcome</p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{problem.desiredOutcome}</p>
                  </div>
                )}

                {problem.hasExistingSolutions && problem.existingSolutionsDescription && (
                  <div>
                    <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-3">Existing Solutions & Why They Fail</p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{problem.existingSolutionsDescription}</p>
                  </div>
                )}

                {problem.affectedAudience?.length > 0 && (
                  <div>
                    <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-700 mb-3">Affected Audience</p>
                    <div className="flex flex-wrap gap-2">
                      {problem.affectedAudience.map(a => (
                        <span key={a} className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Submissions Tab ── */}
            {activeTab === 'submissions' && (
              <div>
                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <p className="text-sm font-medium text-neutral-600">No submissions yet</p>
                    <p className="text-xs text-neutral-700">Be the first to solve this problem</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {submissions.map((sub) => {
                      const dev = typeof sub.developerId === 'object' ? sub.developerId : {};
                      return (
                        <div key={sub._id}
                          className="sub-card rounded-xl p-4 sm:p-5 border border-neutral-900 cursor-pointer"
                          style={{ background: '#111111' }}
                          onClick={() => { setSelectedSubmission(sub); setPanelOpen(true); }}>

                          {/* Top row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              {dev.profilePicture ? (
                                <img src={dev.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-blue-950 text-blue-400">
                                  {dev.name?.charAt(0) || 'D'}
                                </div>
                              )}
                              <div>
                                <p className="text-[0.75rem] font-bold text-white">{dev.name || 'Anonymous'}</p>
                                <p className="text-[0.6rem] text-neutral-600">
                                  {dev.wins > 0 && `${dev.wins} wins`}
                                  {dev.wins > 0 && dev.rating > 0 && ' · '}
                                  {dev.rating > 0 && `${dev.rating} rating`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {sub.isWinner && (
                                <span className="hidden sm:block text-[0.62rem] font-bold px-2.5 py-1 rounded-full bg-amber-950/50 text-amber-400 border border-amber-900/50">
                                  Winner
                                </span>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleVote(sub._id); }}
                                disabled={votingId === sub._id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer disabled:opacity-50"
                                style={{ background: 'transparent', borderColor: '#262626' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#ff5c3a'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#262626'}>
                                {votingId === sub._id ? (
                                  <div className="w-3 h-3 rounded-full border border-neutral-600 border-t-white animate-spin" />
                                ) : (
                                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                                    <path d="M12 19V5M5 12l7-7 7 7" stroke="#ff5c3a" strokeWidth="2.5" strokeLinecap="round"/>
                                  </svg>
                                )}
                                <span className="text-xs font-bold text-white">{sub.votedBy?.length || 0}</span>
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                            {sub.description?.length > 160 ? `${sub.description.substring(0, 160)}...` : sub.description}
                          </p>

                          {/* Tech Stack */}
                          {sub.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {sub.techStack.slice(0, 5).map((tech, i) => {
                                const c = TECH_COLORS[i % TECH_COLORS.length];
                                return (
                                  <span key={tech} className={`text-[0.62rem] font-semibold px-2 py-0.5 rounded-md border ${c.bg} ${c.text} ${c.border}`}>
                                    {tech}
                                  </span>
                                );
                              })}
                              {sub.techStack.length > 5 && (
                                <span className="text-[0.62rem] text-neutral-600 px-1">+{sub.techStack.length - 5}</span>
                              )}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex items-center gap-2 pt-3 border-t border-neutral-900">
                            {sub.githubLink && (
                              <a href={sub.githubLink} target="_blank" rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[0.68rem] font-medium px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-500 border border-neutral-800 hover:text-white hover:border-neutral-600 transition-all no-underline">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                </svg>
                                GitHub
                              </a>
                            )}
                            {sub.liveLink && (
                              <a href={sub.liveLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[0.68rem] font-medium px-3 py-1.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:border-emerald-700 transition-all no-underline">
                                Live
                              </a>
                            )}
                            {sub.videoDemo && (
                              <a href={sub.videoDemo} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[0.68rem] font-medium px-3 py-1.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 hover:border-red-700 transition-all no-underline">
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm font-medium text-neutral-600">Discussion coming soon</p>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-[300px] lg:flex-shrink-0 flex flex-col gap-4">

            {/* Problem Details */}
            <div className="rounded-xl border border-neutral-800 overflow-hidden" style={{ background: '#111111' }}>
              <div className="px-5 py-4 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-white">Problem Details</h3>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3.5">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Priority Score</span>
                  <span className="text-xs font-bold text-amber-400">{problem.priorityScore || 0}/9</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Pain Level</span>
                  {pm.label && (
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${pm.bgClass} ${pm.textClass} ${pm.borderClass}`}>
                      {pm.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Frequency</span>
                  {fm.label && (
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${fm.bgClass} ${fm.textClass} ${fm.borderClass}`}>
                      {fm.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Status</span>
                  <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${statusColors[problem.status] || statusColors.open}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Deadline</span>
                    <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${urgent ? 'bg-red-950/50 text-[#ff5c3a] border-red-900/50' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
                      {formatDate(problem.deadline)}
                    </span>
                  </div>
                  {problem.status === 'open' && (
                    <DeadlineExtend
                      problem={problem}
                      getToken={getToken}
                      isOwner={isOwner}
                      onUpdate={(newDeadline) => setProblem(prev => ({ ...prev, deadline: newDeadline }))}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-900">
                  <span className="text-xs text-neutral-500">Submissions</span>
                  <span className="text-xs font-bold text-white">{submissions.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Views</span>
                  <span className="text-xs font-bold text-white">{problem.views?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            {/* Posted By */}
            <div className="rounded-xl border border-neutral-800 overflow-hidden" style={{ background: '#111111' }}>
              <div className="px-5 py-4 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-white">Posted By</h3>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {problem.postedBy?.profilePicture ? (
                    <img src={problem.postedBy.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-[#ff5c3a] text-white">
                      {problem.postedBy?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{problem.postedBy?.name || 'Anonymous'}</p>
                    <p className="text-xs text-neutral-600">{problem.postedBy?.bio || 'Problem poster'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Progress */}
            <div className="rounded-xl border border-neutral-800 overflow-hidden" style={{ background: '#111111' }}>
              <div className="px-5 py-4 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-white">Submission Progress</h3>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-neutral-500">{submissions.length} solution{submissions.length !== 1 ? 's' : ''} submitted</span>
                  <span className="text-xs text-neutral-500">{hasWinner ? 'Winner picked' : 'Open'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: hasWinner ? '100%' : `${Math.min((submissions.length / 10) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #ff5c3a, #ff8c3a)',
                    }} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer border-0 transition-all duration-150"
              style={{ background: '#ff5c3a' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ff4422'}
              onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
              onClick={() => setModalOpen(true)}>
              Submit Your Solution
            </button>

          </div>
        </div>
      </div>

      <SubmissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        problem={problem}
        onSubmit={handleSubmit}
      />

      <SubmissionDetailPanel
        submission={selectedSubmission}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        isOwner={isOwner}
        onVote={handleVote}
        onSelectWinner={handleSelectWinner}
        votingId={votingId}
      />
    </div>
  );
}