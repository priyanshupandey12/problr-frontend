import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { problemAPI } from "../utils/api";

const CATEGORIES = [
  { value: "healthcare",          label: "Healthcare"    },
  { value: "transportation",      label: "Transportation"},
  { value: "education",           label: "Education"     },
  { value: "finance",             label: "Finance"       },
  { value: "workplace",           label: "Workplace"     },
  { value: "shopping-retail",     label: "Retail"        },
  { value: "government-services", label: "Government"    },
  { value: "housing",             label: "Housing"       },
  { value: "social-community",    label: "Community"     },
  { value: "productivity",        label: "Productivity"  },
  { value: "other",               label: "Other"         },
];

const SEVERITY = [
  { value: "safety-risk",        label: "Safety Risk"        },
  { value: "stressful",          label: "Stressful"          },
  { value: "costs-money",        label: "Costs Money"        },
  { value: "time-consuming",     label: "Time Consuming"     },
  { value: "mild-inconvenience", label: "Mild Inconvenience" },
];

const FREQUENCY = [
  { value: "daily",            label: "Daily"            },
  { value: "weekly",           label: "Weekly"           },
  { value: "monthly",          label: "Monthly"          },
  { value: "rare-but-serious", label: "Rare but Serious" },
];

const USERS_AFFECTED = [
  { value: "elderly",                label: "Senior Citizens"       },
  { value: "students",               label: "Students"              },
  { value: "working-professionals",  label: "Working Professionals" },
  { value: "parents",                label: "Parents"               },
  { value: "business-owners",        label: "Business Owners"       },
  { value: "developers",             label: "Developers"            },
  { value: "everyone",               label: "Everyone"              },
];

const EMPTY_FORM = {
  title: "", category: "", deadline: "", painLevel: "", frequency: "",
  affectedAudience: [], description: "", hasExistingSolutions: null,
  existingSolutionsDescription: "", desiredOutcome: "",
};

export default function PostProblemModal({ isOpen, onClose, onSuccess }) {
  const { getToken } = useAuth();
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError]   = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const toggle = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 20)      e.title = "Title must be at least 20 characters";
    if (!form.category)                              e.category = "Select a category";
    if (!form.deadline)                              e.deadline = "Select a deadline";
    if (!form.painLevel)                             e.painLevel = "Select pain level";
    if (!form.frequency)                             e.frequency = "Select frequency";
    if (form.affectedAudience.length === 0)          e.affectedAudience = "Select at least one audience";
    if (!form.description || form.description.length < 50) e.description = "Description must be at least 50 characters";
    if (form.hasExistingSolutions === null)          e.hasExistingSolutions = "Select an option";
    if (form.hasExistingSolutions && !form.existingSolutionsDescription)
      e.existingSolutionsDescription = "Please explain why existing solutions aren't good enough";
    if (!form.desiredOutcome || form.desiredOutcome.length < 20)
      e.desiredOutcome = "Desired outcome must be at least 20 characters";
    return e;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError("");
    try {
      const token    = await getToken();
      const response = await problemAPI.createProblem(token, form);
      setForm(EMPTY_FORM);
      if (onSuccess) onSuccess(response);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.error
        || error.response?.data?.details?.[0]?.join(", ")
        || "Failed to create problem. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Style helpers ──
  const inputCls = (hasError) =>
    `w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150 ${
      hasError
        ? 'border border-[#ff5c3a] bg-[#1a1a1a]'
        : 'border border-[#2a2a2a] bg-[#1a1a1a] focus:border-[#ff5c3a]'
    }`;

  const cardBtnCls = (selected) =>
    `flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border text-[0.7rem] font-medium cursor-pointer transition-all duration-150 ${
      selected
        ? 'bg-[#2a2a2a] border-[#555] text-white'
        : 'bg-[#161616] border-[#2a2a2a] text-neutral-500 hover:border-[#444] hover:text-neutral-300'
    }`;

  const pillBtnCls = (selected) =>
    `px-3 py-1.5 rounded-full border text-[0.72rem] cursor-pointer transition-all duration-150 whitespace-nowrap ${
      selected
        ? 'bg-[#2a2a2a] border-[#555] text-white'
        : 'bg-transparent border-[#2a2a2a] text-neutral-500 hover:border-[#444] hover:text-neutral-300'
    }`;

  const err = (key) => errors[key]
    ? <p className="text-[0.68rem] text-[#ff5c3a] mt-1">{errors[key]}</p>
    : null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        {/* ── Modal ── */}
        <div
          className="relative w-full rounded-2xl border border-[#2a2a2a] overflow-y-auto"
          style={{
            background: '#111111',
            maxWidth: '600px',
            maxHeight: '90vh',
            scrollbarWidth: 'thin',
            scrollbarColor: '#2a2a2a transparent',
          }}
        >
          <div className="p-6 sm:p-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                  Post a Problem
                </h2>
                <p className="text-xs text-neutral-600 mt-1">
                  Describe a real friction — not a product idea
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-neutral-500 hover:text-white hover:border-[#444] transition-all cursor-pointer flex-shrink-0 ml-4"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="rounded-xl border border-[#ff5c3a]/40 bg-[#ff5c3a]/08 px-4 py-3 mb-6">
                <p className="text-xs text-[#ff5c3a]">{serverError}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Title</label>
                  <span className="text-[0.65rem] text-neutral-600">20–100 chars</span>
                </div>
                <input
                  className={inputCls(!!errors.title)}
                  placeholder="e.g. Finding parking near metro stations takes 20-30 minutes daily"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
                {errors.title
                  ? err('title')
                  : <p className="text-[0.65rem] text-neutral-700 mt-1">Describe the friction, not the solution.</p>
                }
              </div>

              {/* Category + Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Category</label>
                  <select
                    className={`${inputCls(!!errors.category)} cursor-pointer`}
                    style={{ colorScheme: 'dark' }}
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {err('category')}
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Deadline</label>
                  <input
                    type="date"
                    className={inputCls(!!errors.deadline)}
                    style={{ colorScheme: 'dark' }}
                    value={form.deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  />
                  {err('deadline')}
                </div>
              </div>

              {/* Pain Level */}
              <div>
                <label className="block text-xs font-bold text-white mb-3">Pain Level</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SEVERITY.map(s => (
                    <button key={s.value} type="button"
                      onClick={() => setForm(p => ({ ...p, painLevel: s.value }))}
                      className={cardBtnCls(form.painLevel === s.value)}>
                      <span className="text-[0.7rem] text-center leading-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
                {err('painLevel')}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-bold text-white mb-3">Frequency</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FREQUENCY.map(f => (
                    <button key={f.value} type="button"
                      onClick={() => setForm(p => ({ ...p, frequency: f.value }))}
                      className={cardBtnCls(form.frequency === f.value)}>
                      <span className="text-[0.7rem]">{f.label}</span>
                    </button>
                  ))}
                </div>
                {err('frequency')}
              </div>

              {/* Affected Audience */}
              <div>
                <label className="block text-xs font-bold text-white mb-3">Who faces this problem?</label>
                <div className="flex flex-wrap gap-2">
                  {USERS_AFFECTED.map(u => (
                    <button key={u.value} type="button"
                      onClick={() => toggle('affectedAudience', u.value)}
                      className={pillBtnCls(form.affectedAudience.includes(u.value))}>
                      {u.label}
                    </button>
                  ))}
                </div>
                {err('affectedAudience')}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Description</label>
                  <span className="text-[0.65rem] text-neutral-600">50–500 chars</span>
                </div>
                <textarea
                  className={`${inputCls(!!errors.description)} resize-y`}
                  style={{ minHeight: '100px' }}
                  placeholder="Explain the problem in detail — the specific friction, who it affects, and why current workarounds fail."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
                {err('description')}
              </div>

              {/* Existing Solutions */}
              <div>
                <label className="block text-xs font-bold text-white mb-3">Do existing solutions exist?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: true,  label: 'Yes, but they fail' },
                    { val: false, label: 'No solutions exist'  },
                  ].map(({ val, label }) => (
                    <button key={String(val)} type="button"
                      onClick={() => setForm(p => ({ ...p, hasExistingSolutions: val }))}
                      className={`py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        form.hasExistingSolutions === val
                          ? 'bg-[#2a2a2a] border-[#555] text-white'
                          : 'bg-[#161616] border-[#2a2a2a] text-neutral-500 hover:border-[#444]'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                {form.hasExistingSolutions === true && (
                  <textarea
                    className={`${inputCls(!!errors.existingSolutionsDescription)} resize-y mt-3`}
                    style={{ minHeight: '80px' }}
                    placeholder="Why are existing solutions not good enough?"
                    value={form.existingSolutionsDescription}
                    onChange={e => setForm(p => ({ ...p, existingSolutionsDescription: e.target.value }))}
                  />
                )}
                {err('hasExistingSolutions')}
                {err('existingSolutionsDescription')}
              </div>

              {/* Desired Outcome */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Desired Outcome</label>
                  <span className="text-[0.65rem] text-neutral-600">20–300 chars</span>
                </div>
                <textarea
                  className={`${inputCls(!!errors.desiredOutcome)} resize-y`}
                  style={{ minHeight: '90px' }}
                  placeholder="What does success look like? Describe a result, not a product."
                  value={form.desiredOutcome}
                  onChange={e => setForm(p => ({ ...p, desiredOutcome: e.target.value }))}
                />
                <p className="text-[0.65rem] text-neutral-700 mt-1">
                  Avoid "AI", "app", "website". Focus on the human outcome.
                </p>
                {err('desiredOutcome')}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
                <span className="text-[0.68rem] text-neutral-700">All fields required</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="text-xs font-medium px-5 py-2 rounded-full border border-[#2a2a2a] text-neutral-500 hover:text-white hover:border-[#444] transition-all cursor-pointer bg-transparent disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="text-xs font-bold px-6 py-2 rounded-full text-white transition-all cursor-pointer border-0 disabled:opacity-60 flex items-center gap-2"
                    style={{ background: '#ff5c3a' }}
                    onMouseEnter={e => !isSubmitting && (e.currentTarget.style.background = '#ff4422')}
                    onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
                  >
                    {isSubmitting && (
                      <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                    )}
                    {isSubmitting ? 'Posting...' : 'Post Problem'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}