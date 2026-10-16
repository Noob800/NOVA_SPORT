import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { WorkspaceShell } from './components/layout/WorkspaceShell';
import { Home } from './pages/public/Home';
import { CompetitionHub } from './pages/public/CompetitionHub';
import { MyNova } from './pages/my_nova/MyNova';
import './App.css';

import { Explore } from './pages/public/Explore';
import { Matches } from './pages/public/Matches';
import { MatchCenter } from './pages/public/MatchCenter';
import { Following } from './pages/public/Following';
import { TeamProfile } from './pages/public/TeamProfile';
import { PlayerProfile } from './pages/public/PlayerProfile';
import { NewsArticle } from './pages/public/NewsArticle';
import { TeamDesk } from './pages/team/TeamDesk';
import { MatchdayDesk } from './pages/official/MatchdayDesk';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="matches" element={<Matches />} />
          <Route path="matches/:id" element={<MatchCenter />} />
          <Route path="following" element={<Following />} />
          <Route path="mynova" element={<MyNova />} />
          <Route path="competitions/:id" element={<CompetitionHub />} />
          <Route path="teams/:id" element={<TeamProfile />} />
          <Route path="players/:id" element={<PlayerProfile />} />
          <Route path="news/:id" element={<NewsArticle />} />
        </Route>

        {/* Role-specific workspaces */}
        <Route path="/workspace" element={<WorkspaceShell />}>
          <Route index element={<Navigate to="/workspace/team/overview" replace />} />
          <Route path="team" element={<Navigate to="/workspace/team/overview" replace />} />
          <Route path="team/:section" element={<TeamDesk />} />
          <Route path="official" element={<Navigate to="/workspace/official/matches" replace />} />
          <Route path="official/:section" element={<MatchdayDesk />} />
          <Route path="admin" element={<Navigate to="/workspace/admin/overview" replace />} />
          <Route path="admin/:section" element={<AdminDashboard />} />
          <Route path="admin/:section/:subId" element={<AdminDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
