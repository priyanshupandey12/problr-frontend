import { useState, useEffect, useRef } from 'react';


function Label({ children, required }) {
  return (
    <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-neutral-600 mb-1.5">
      {children}
      {required && <span className="text-[#ff5c3a] ml-1">*</span>}
    </label>
  );
}

function Input({ error, ...props }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full bg-[#0d0d0d] border ${error ? 'border-red-800' : 'border-neutral-800'} 
          rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-700
          focus:outline-none focus:border-[#ff5c3a] transition-colors duration-150`}
      />
      {error && <p className="text-[0.65rem] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Textarea({ error, ...props }) {
  return (
    <div>
      <textarea
        {...props}
        className={`w-full bg-[#0d0d0d] border ${error ? 'border-red-800' : 'border-neutral-800'}
          rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 resize-none
          focus:outline-none focus:border-[#ff5c3a] transition-colors duration-150`}
      />
      {error && <p className="text-[0.65rem] text-red-500 mt-1">{error}</p>}
    </div>
  );
}


const TAG_COLORS = [
  { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-900/40' },
  { bg: 'bg-blue-950/40',   text: 'text-blue-400',   border: 'border-blue-900/40'   },
  { bg: 'bg-emerald-950/40',text: 'text-emerald-400',border: 'border-emerald-900/40'},
  { bg: 'bg-violet-950/40', text: 'text-violet-400', border: 'border-violet-900/40' },
  { bg: 'bg-amber-950/40',  text: 'text-amber-400',  border: 'border-amber-900/40'  },
  { bg: 'bg-red-950/40',    text: 'text-red-400',    border: 'border-red-900/40'    },
  { bg: 'bg-pink-950/40',   text: 'text-pink-400',   border: 'border-pink-900/40'   },
  { bg: 'bg-cyan-950/40',   text: 'text-cyan-400',   border: 'border-cyan-900/40'   },
];

function TagInput({ values, onChange, placeholder, max = 10, colorful = false, error }) {
  const [input, setInput] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || values.includes(tag) || values.length >= max) return;
    onChange([...values, tag]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      <div
        className={`min-h-[42px] w-full bg-[#0d0d0d] border ${error ? 'border-red-800' : 'border-neutral-800'}
          rounded-lg px-3 py-2 flex flex-wrap gap-1.5 items-center
          focus-within:border-[#ff5c3a] transition-colors duration-150`}
      >
        {values.map((tag, i) => {
          const c = colorful ? TAG_COLORS[i % TAG_COLORS.length] : null;
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border
                ${colorful
                  ? `${c.bg} ${c.text} ${c.border}`
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(values.filter(v => v !== tag))}
                className="ml-0.5 text-neutral-600 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 leading-none"
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-neutral-700 outline-none border-none"
        />
      </div>
      <p className="text-[0.6rem] text-neutral-700 mt-1">{values.length}/{max} — press Enter or comma to add</p>
      {error && <p className="text-[0.65rem] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}


function StepDot({ active, done, label, num }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-bold border transition-all duration-300
        ${done
          ? 'bg-[#ff5c3a] border-[#ff5c3a] text-white'
          : active
          ? 'bg-transparent border-[#ff5c3a] text-[#ff5c3a]'
          : 'bg-transparent border-neutral-800 text-neutral-700'
        }`}>
        {done ? '✓' : num}
      </div>
      <span className={`text-[0.58rem] font-semibold tracking-wide transition-colors duration-200
        ${active ? 'text-white' : done ? 'text-[#ff5c3a]' : 'text-neutral-700'}`}>
        {label}
      </span>
    </div>
  );
}


export default function SubmissionModal({ isOpen, onClose, problem, onSubmit }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    githubLink: '',
    liveLink: '',
    videoDemo: '',
    techStack: [],
    features: [],
  });

  const [errors, setErrors] = useState({});

 
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSubmitted(false);
      setErrors({});
      setForm({ title: '', description: '', githubLink: '', liveLink: '', videoDemo: '', techStack: [], features: [] });
    }
  }, [isOpen]);


  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);


  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

 
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.title.trim()) e.title = 'Title is required';
      else if (form.title.trim().length < 10) e.title = 'At least 10 characters';
      if (!form.description.trim()) e.description = 'Description is required';
      else if (form.description.trim().length < 50) e.description = `${50 - form.description.trim().length} more characters needed`;
    }
    if (s === 2) {
      if (!form.githubLink.trim()) e.githubLink = 'GitHub link is required';
      else if (!/^https?:\/\/(www\.)?github\.com\/.+/.test(form.githubLink)) e.githubLink = 'Enter a valid GitHub URL';
      if (form.liveLink && !/^https?:\/\/.+/.test(form.liveLink)) e.liveLink = 'Enter a valid URL';
      if (form.videoDemo && !/^https?:\/\/.+/.test(form.videoDemo)) e.videoDemo = 'Enter a valid URL';
    }
    if (s === 3) {
      if (form.techStack.length === 0) e.techStack = 'Add at least one technology';
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const e = validateStep(3);
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      await onSubmit(form);
      setSubmitted(true);
    } catch (err) {
    const message = err?.response?.data?.error || err.message || 'Kuch gadbad ho gayi, dobara try karo';
    setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { num: 1, label: 'Overview' },
    { num: 2, label: 'Links' },
    { num: 3, label: 'Tech' },
  ];

  const descLen = form.description.trim().length;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-neutral-800 overflow-hidden"
        style={{ background: '#111111' }}
      >
       
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-900">
          <div>
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-[#ff5c3a] mb-1">Submit Solution</p>
            <h2 className="text-sm font-bold text-white leading-snug line-clamp-1 max-w-[340px]">
              {problem?.title || 'Problem'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-600 hover:text-white hover:border-neutral-600 transition-all cursor-pointer flex-shrink-0 ml-3"
          >
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

      
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'rgba(255,92,58,0.1)', border: '1px solid rgba(255,92,58,0.3)' }}>
              🎉
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white mb-1.5">Submission Done!</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tera solution submit ho gaya. Poster review karega aur community vote karega.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white cursor-pointer border-0 transition-all"
              style={{ background: '#ff5c3a' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ff4422'}
              onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
            >
              Done
            </button>
          </div>
        ) : (
          <>
           
            <div className="px-6 py-4 flex items-center gap-0">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <StepDot
                    num={s.num}
                    label={s.label}
                    active={step === s.num}
                    done={step > s.num}
                  />
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-2 mb-4 transition-colors duration-300
                      ${step > s.num ? 'bg-[#ff5c3a]' : 'bg-neutral-800'}`} />
                  )}
                </div>
              ))}
            </div>

         
            <div className="flex-1 overflow-y-auto px-6 pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e1e #111111' }}>

            
              {step === 1 && (
                <div className="flex flex-col gap-4 py-2">
                  <div>
                    <Label required>Solution Title</Label>
                    <Input
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      placeholder="e.g. AutoFare Tracker — Real-time fare estimator"
                      maxLength={100}
                      error={errors.title}
                    />
                    <p className="text-[0.6rem] text-neutral-700 mt-1 text-right">{form.title.length}/100</p>
                  </div>

                  <div>
                    <Label required>How did you solve it?</Label>
                    <Textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Explain your approach, what makes it different, key decisions you made..."
                      rows={5}
                      maxLength={1000}
                      error={errors.description}
                    />
                    <div className="flex justify-between mt-1">
                      <p className={`text-[0.6rem] ${descLen < 50 ? 'text-orange-600' : 'text-neutral-700'}`}>
                        {descLen < 50 ? `${50 - descLen} more chars needed` : '✓ Looks good'}
                      </p>
                      <p className="text-[0.6rem] text-neutral-700">{descLen}/1000</p>
                    </div>
                  </div>
                </div>
              )}

         
              {step === 2 && (
                <div className="flex flex-col gap-4 py-2">
                  <div>
                    <Label required>GitHub Repository</Label>
                    <Input
                      value={form.githubLink}
                      onChange={e => set('githubLink', e.target.value)}
                      placeholder="https://github.com/username/repo"
                      error={errors.githubLink}
                    />
                  </div>

                  <div>
                    <Label>Live Demo URL <span className="text-neutral-700 normal-case font-normal tracking-normal">(optional)</span></Label>
                    <Input
                      value={form.liveLink}
                      onChange={e => set('liveLink', e.target.value)}
                      placeholder="https://your-app.vercel.app"
                      error={errors.liveLink}
                    />
                  </div>

                  <div>
                    <Label>Video Demo URL <span className="text-neutral-700 normal-case font-normal tracking-normal">(optional)</span></Label>
                    <Input
                      value={form.videoDemo}
                      onChange={e => set('videoDemo', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      error={errors.videoDemo}
                    />
                  </div>

                  <div className="rounded-lg border border-neutral-900 p-3.5 bg-[#0d0d0d]">
                    <p className="text-[0.65rem] text-neutral-600 leading-relaxed">
                      💡 <span className="text-neutral-500">Live demo aur video hone se</span> chances badh jaate hain winner banne ke. Reviewers directly dekh sakte hain solution.
                    </p>
                  </div>
                </div>
              )}

         
              {step === 3 && (
                <div className="flex flex-col gap-4 py-2">
                  <div>
                    <Label required>Tech Stack</Label>
                    <TagInput
                      values={form.techStack}
                      onChange={v => { set('techStack', v); }}
                      placeholder="React, Node.js, MongoDB..."
                      max={10}
                      colorful
                      error={errors.techStack}
                    />
                  </div>

                  <div>
                    <Label>Key Features <span className="text-neutral-700 normal-case font-normal tracking-normal">(optional)</span></Label>
                    <TagInput
                      values={form.features}
                      onChange={v => set('features', v)}
                      placeholder="Real-time updates, Offline mode..."
                      max={10}
                      error={errors.features}
                    />
                  </div>

                  {errors.submit && (
                    <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3">
                      <p className="text-xs text-red-400">{errors.submit}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-900 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full bg-transparent border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
                >
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                    <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Back
                </button>
              ) : (
                <div /> 
              )}

              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] text-neutral-700">{step} of {steps.length}</span>

                {step < 3 ? (
                  <button
                    onClick={next}
                    className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full text-white cursor-pointer border-0 transition-all"
                    style={{ background: '#ff5c3a' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ff4422'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
                  >
                    Next
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full text-white cursor-pointer border-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#ff5c3a' }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.background = '#ff4422')}
                    onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>🚀 Submit Solution</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}