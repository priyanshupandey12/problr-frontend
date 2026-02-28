import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { userAPI } from '../utils/api';

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

function SkillsInput({ values, onChange }) {
  const [input, setInput] = useState('');

  const addSkill = (raw) => {
    const skill = raw.trim();
    if (!skill || values.includes(skill) || values.length >= 20) return;
    onChange([...values, skill]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="min-h-[42px] w-full bg-[#0d0d0d] border border-neutral-800 rounded-lg px-3 py-2
        flex flex-wrap gap-1.5 items-center focus-within:border-[#ff5c3a] transition-colors duration-150">
        {values.map((skill, i) => {
          const c = TECH_COLORS[i % TECH_COLORS.length];
          return (
            <span key={skill}
              className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2.5 py-1 rounded-md border ${c.bg} ${c.text} ${c.border}`}>
              {skill}
              <button type="button" onClick={() => onChange(values.filter(v => v !== skill))}
                className="ml-0.5 text-neutral-600 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 leading-none">
                ×
              </button>
            </span>
          );
        })}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(input)}
          placeholder={values.length === 0 ? 'React, Node.js, MongoDB...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-neutral-700 outline-none border-none"
        />
      </div>
      <p className="text-[0.6rem] text-neutral-700 mt-1">{values.length}/20 — press Enter or comma to add</p>
    </div>
  );
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const [user, setUser]         = useState(null);

  const [form, setForm] = useState({
    bio: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await userAPI.getCurrentUser(token);
      const u = data.user;
      setUser(u);
      setForm({
        bio:         u.bio || '',
        skills:      u.skills || [],
        githubUrl:   u.githubUrl || '',
        linkedinUrl: u.linkedinUrl || '',
        websiteUrl:  u.websiteUrl || '',
        role:        u.role || 'user',
      });
    } catch (err) {
      setError('Profile load nahi ho payi');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (form.githubUrl && !/^https?:\/\/.+/.test(form.githubUrl))
      e.githubUrl = 'Valid URL chahiye (https://...)';
    if (form.linkedinUrl && !/^https?:\/\/.+/.test(form.linkedinUrl))
      e.linkedinUrl = 'Valid URL chahiye (https://...)';
    if (form.websiteUrl && !/^https?:\/\/.+/.test(form.websiteUrl))
      e.websiteUrl = 'Valid URL chahiye (https://...)';
    if (form.bio.length > 500)
      e.bio = '500 characters se zyada nahi';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      await userAPI.updateProfile(token, form);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Update nahi ho payi, dobara try karo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-neutral-800 border-t-[#ff5c3a] animate-spin" />
        <p className="text-xs text-neutral-600">Loading profile...</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(255,92,58,0.1)', border: '1px solid rgba(255,92,58,0.3)' }}>
          ✅
        </div>
        <p className="text-sm font-bold text-white">Profile update ho gayi!</p>
        <p className="text-xs text-neutral-600">Dashboard pe ja rahe hain...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[76px]">
      <style>{`
        html::-webkit-scrollbar { width: 4px; }
        html::-webkit-scrollbar-track { background: #0a0a0a; }
        html::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 999px; }
        html { scrollbar-width: thin; scrollbar-color: #1e1e1e #0a0a0a; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

 
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6 text-xs font-medium text-neutral-600 hover:text-[#ff5c3a] transition-colors bg-transparent border border-neutral-800 hover:border-neutral-700 rounded-full px-3 py-1.5 cursor-pointer">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Back to Dashboard
        </button>

   
        <div className="mb-8">
          <p className="text-[0.6rem] font-bold tracking-widest uppercase text-[#ff5c3a] mb-1">Settings</p>
          <h1 className="text-xl font-extrabold text-white">Edit Profile</h1>
    
        </div>


        {user && (
          <div className="flex items-center gap-4 mb-8 p-4 rounded-xl border border-neutral-800"
            style={{ background: '#111111' }}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt=""
                className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black flex-shrink-0"
                style={{ background: '#ff5c3a', color: '#fff' }}>
                {user.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-neutral-600">{user.email}</p>
            </div>
          </div>
        )}

     
        <div className="flex flex-col gap-6">

    

    
          <div>
            <Label>Bio</Label>
            <div>
              <textarea
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Tell me about yourself, your experience, or anything you want others to know!"
                className={`w-full bg-[#0d0d0d] border ${errors.bio ? 'border-red-800' : 'border-neutral-800'}
                  rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 resize-none
                  focus:outline-none focus:border-[#ff5c3a] transition-colors duration-150`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.bio
                  ? <p className="text-[0.65rem] text-red-500">{errors.bio}</p>
                  : <span />
                }
                <p className="text-[0.6rem] text-neutral-700">{form.bio.length}/500</p>
              </div>
            </div>
          </div>

    

      
          <div className="rounded-xl border border-neutral-800 p-5 flex flex-col gap-4"
            style={{ background: '#111111' }}>
            <p className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-600">Links</p>

            <div>
              <Label>GitHub URL</Label>
              <Input
                value={form.githubUrl}
                onChange={e => set('githubUrl', e.target.value)}
                placeholder="https://github.com/username"
                error={errors.githubUrl}
              />
            </div>

            <div>
              <Label>LinkedIn URL</Label>
              <Input
                value={form.linkedinUrl}
                onChange={e => set('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                error={errors.linkedinUrl}
              />
            </div>

            <div>
              <Label>Website URL</Label>
              <Input
                value={form.websiteUrl}
                onChange={e => set('websiteUrl', e.target.value)}
                placeholder="https://yoursite.com"
                error={errors.websiteUrl}
              />
            </div>
          </div>

       
          {error && (
            <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

       
          <div className="flex items-center gap-3 pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full text-white cursor-pointer border-0 disabled:opacity-50 transition-all"
              style={{ background: '#ff5c3a' }}
              onMouseEnter={e => !saving && (e.currentTarget.style.background = '#ff4422')}
              onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium px-6 py-3 rounded-full text-neutral-500 hover:text-white transition-colors cursor-pointer bg-transparent border border-neutral-800 hover:border-neutral-600"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}