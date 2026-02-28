import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import ProblemsPage from './pages/Problems';
import ProblemDetailPage from './pages/problemdetails';
import EditProfilePage from './pages/Editprofilepage';
import LeaderboardPage from './pages/leaderboard';
import { UnauthorizedPage, AppErrorBoundary } from './components/errorstate';


function AuthGuard({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><UnauthorizedPage /></SignedOut>
    </>
  );
}
function App() {
  return (
    <Router>
       <AppErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        <Navbar />
        
        <Routes>
              <Route path="/" element={<Home />} />
            <Route path="/dashboard"    element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/problems"     element={<AuthGuard><ProblemsPage /></AuthGuard>} />
            <Route path="/problems/:id" element={<AuthGuard><ProblemDetailPage /></AuthGuard>} />
            <Route path="/profile/edit" element={<AuthGuard><EditProfilePage /></AuthGuard>} />
            <Route path="/leaderboard"  element={<LeaderboardPage />} />
        </Routes>
  
      </div>
       </AppErrorBoundary>
    </Router>
  );
}

export default App;