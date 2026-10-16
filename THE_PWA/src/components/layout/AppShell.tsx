import { NavLink, Outlet } from 'react-router-dom';
import { Home, Compass, CalendarDays, Star, User, Shield, Award, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleSelector } from '../../pages/my_nova/RoleSelector';
import './AppShell.css';

export function AppShell() {
  const { user } = useAuth();
  const isCoach = user?.activeRole === 'COACH';
  const isOfficial = user?.activeRole === 'OFFICIAL';
  const isPlayer = user?.activeRole === 'PLAYER';

  let roleDestination = '/mynova';
  let roleLabel = 'My Nova';
  let roleIconDesktop = <User size={20} />;
  let roleIconMobile = <User size={24} />;

  if (isCoach) {
    roleDestination = '/workspace/team/overview';
    roleLabel = 'Team Desk';
    roleIconDesktop = <Shield size={20} />;
    roleIconMobile = <Shield size={24} />;
  } else if (isOfficial) {
    roleDestination = '/workspace/official/matches';
    roleLabel = 'Match Desk';
    roleIconDesktop = <Award size={20} />;
    roleIconMobile = <Award size={24} />;
  } else if (isPlayer) {
    roleDestination = '/mynova';
    roleLabel = 'My Nova';
    roleIconDesktop = <Users size={20} />;
    roleIconMobile = <Users size={24} />;
  }

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mobile-brand-container">
            <img src="/favicon.svg" alt="N" className="brand-logo" />
            <span className="brand-text">OVA SPORT</span>
          </div>
        </div>

        <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
          <RoleSelector />
        </div>

        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={20} /> Explore
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} /> Matches
          </NavLink>
          <NavLink to="/following" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Star size={20} /> Following
          </NavLink>
          <NavLink to={roleDestination} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {roleIconDesktop} {roleLabel}
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="mobile-header">
          <div className="mobile-brand-container">
            <img src="/favicon.svg" alt="N" className="mobile-brand-n" />
            <span className="mobile-brand-text">OVA SPORT</span>
          </div>
          <RoleSelector compact={true} />
        </header>
        <div className="content-scroll">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Compass size={24} />
          <span>Explore</span>
        </NavLink>
        <NavLink to="/matches" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <CalendarDays size={24} />
          <span>Matches</span>
        </NavLink>
        <NavLink to="/following" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Star size={24} />
          <span>Following</span>
        </NavLink>
        <NavLink to={roleDestination} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          {roleIconMobile}
          <span>{roleLabel}</span>
        </NavLink>
      </nav>
    </div>
  );
}
