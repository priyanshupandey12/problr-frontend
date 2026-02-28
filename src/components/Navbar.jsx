import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import PostProblemModal from './PostProblemModal';


export default function Navbar() {
  const [showModal,  setShowModal]  = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Problems',    to: '/problems'    },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Profile',     to: '/dashboard'   },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* ── Desktop / Tablet Navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-5">
        <nav
          className="w-full sm:w-[70%] lg:w-[60%] flex items-center justify-between px-5 sm:px-8 h-[52px] rounded-full border border-[#2a2a2a] backdrop-blur-xl"
          style={{ background: 'rgba(15,15,15,0.85)' }}
        >
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 no-underline group">
              <div
                className="w-[26px] h-[26px] rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                style={{ background: '#ffffff' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dddddd'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4h10M2 7h7M2 10h5" stroke="#000000" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-black text-[0.98rem] tracking-tight leading-none text-white">
                Prob<span style={{ color: '#888' }}>lr</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            <SignedIn>
              {navLinks.map(({ label, to }) => (
                <Link key={to} to={to}
                  className="text-[0.72rem] font-medium tracking-wide no-underline px-4 py-1.5 rounded-full transition-colors duration-200"
                  style={{ color: isActive(to) ? '#ffffff' : '#aaaaaa' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = isActive(to) ? '#ffffff' : '#aaaaaa'}
                >
                  {label}
                </Link>
              ))}
            </SignedIn>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="text-[0.72rem] font-semibold tracking-widest uppercase px-4 py-[7px] rounded-full border cursor-pointer transition-all duration-200"
                  style={{ color: '#fff', background: 'transparent', borderColor: '#444' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444'; }}
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* Post button — hidden on mobile, shown in menu */}
              <button
                onClick={() => setShowModal(true)}
                className="hidden sm:block text-[0.68rem] font-semibold tracking-widest uppercase px-4 py-[6px] rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer border-0"
                style={{ color: '#fff', background: '#ff5c3a' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ff4422'}
                onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
              >
                + Post a Problem
              </button>

              <UserButton />

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="sm:hidden flex flex-col items-center justify-center w-8 h-8 gap-[5px] bg-transparent border-0 cursor-pointer"
              >
                <span className="block w-5 h-[1.5px] bg-neutral-400 transition-all" style={{ transform: menuOpen ? 'rotate(45deg) translateY(6.5px)' : 'none' }} />
                <span className="block w-5 h-[1.5px] bg-neutral-400 transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
                <span className="block w-5 h-[1.5px] bg-neutral-400 transition-all" style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-6.5px)' : 'none' }} />
              </button>
            </SignedIn>
          </div>
        </nav>

        {/* ── Mobile Dropdown Menu ── */}
        {menuOpen && (
          <div
            className="sm:hidden absolute top-[72px] left-4 right-4 rounded-2xl border border-[#2a2a2a] overflow-hidden"
            style={{ background: 'rgba(15,15,15,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex flex-col p-3 gap-1">
              {navLinks.map(({ label, to }) => (
                <Link key={to} to={to}
                  onClick={() => setMenuOpen(false)}
                  className="no-underline px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: isActive(to) ? '#ff5c3a' : '#aaaaaa',
                    background: isActive(to) ? 'rgba(255,92,58,0.08)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              ))}

              <div className="border-t border-neutral-900 my-1" />

              <button
                onClick={() => { setShowModal(true); setMenuOpen(false); }}
                className="w-full text-sm font-bold py-3 rounded-xl text-white cursor-pointer border-0 transition-all"
                style={{ background: '#ff5c3a' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ff4422'}
                onMouseLeave={e => e.currentTarget.style.background = '#ff5c3a'}
              >
                + Post a Problem
              </button>
            </div>
          </div>
        )}
      </div>

      <PostProblemModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}