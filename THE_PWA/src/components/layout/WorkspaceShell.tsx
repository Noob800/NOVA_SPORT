import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, User, BarChart2, CalendarDays, Users, 
  ClipboardList, Settings,
  ChevronLeft, Bell, ExternalLink,
  LayoutDashboard, Trophy, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { teamDeskStore } from '../../services/teamDeskStore';
import { TeamNoticesModal } from '../../pages/team/components/TeamNoticesModal';
import { RoleSelector } from '../../pages/my_nova/RoleSelector';
import './AppShell.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactElement<{ size?: number }>;
}

const PLAYER_NAV: NavItem[] = [
  { path: '/workspace/player/overview', label: 'Overview', icon: <Home size={20} /> },
  { path: '/workspace/player/profile', label: 'My Profile', icon: <User size={20} /> },
  { path: '/workspace/player/stats', label: 'My Stats', icon: <BarChart2 size={20} /> },
  { path: '/workspace/player/matches', label: 'My Matches', icon: <CalendarDays size={20} /> },
  { path: '/workspace/player/team', label: 'Team', icon: <Users size={20} /> },
];

// Coach Workspace (Team Desk) EXACTLY 5 primary destinations as required
const TEAM_NAV: NavItem[] = [
  { path: '/workspace/team/overview', label: 'Overview', icon: <Home size={20} /> },
  { path: '/workspace/team/squad', label: 'Squad', icon: <Users size={20} /> },
  { path: '/workspace/team/fixtures', label: 'Fixtures', icon: <CalendarDays size={20} /> },
  { path: '/workspace/team/stats', label: 'Team Stats', icon: <BarChart2 size={20} /> },
  { path: '/workspace/team/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const OFFICIAL_NAV: NavItem[] = [
  { path: '/workspace/official/matches', label: 'Assigned Match', icon: <CalendarDays size={20} /> },
  { path: '/workspace/official/operations', label: 'Match Operations', icon: <Settings size={20} /> },
  { path: '/workspace/official/events', label: 'Event Log', icon: <ClipboardList size={20} /> },
  { path: '/workspace/official/profile', label: 'My Profile', icon: <User size={20} /> },
];

// NSFC Streamlined League Management Admin Navigation
const ADMIN_NAV: NavItem[] = [
  { path: '/workspace/admin/overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/workspace/admin/leagues', label: 'Leagues & Seasons', icon: <Trophy size={20} /> },
  { path: '/workspace/admin/teams', label: 'Teams & Rosters', icon: <Users size={20} /> },
  { path: '/workspace/admin/officials', label: 'Official Directory', icon: <ShieldCheck size={20} /> },
  { path: '/workspace/admin/match-official', label: 'Match Official', icon: <CalendarDays size={20} /> },
];

export function WorkspaceShell() {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  const [showNoticesModal, setShowNoticesModal] = useState(false);
  const currentTeamId = user?.assignedTeamId || 't2';
  const profile = teamDeskStore.getProfile(currentTeamId);

  // Unread announcements count
  const unreadCount = teamDeskStore.getAnnouncements(currentTeamId).filter(a => !a.read).length;

  let navItems: NavItem[] = [];
  let workspaceTitle = '';
  const isTeamWorkspace = path.includes('/workspace/team');
  const isOfficialWorkspace = path.includes('/workspace/official');
  const isAdminWorkspace = path.includes('/workspace/admin');

  if (path.includes('/workspace/player')) {
    navItems = PLAYER_NAV;
    workspaceTitle = 'My Nova';
  } else if (isTeamWorkspace) {
    navItems = TEAM_NAV;
    workspaceTitle = 'Team Desk';
  } else if (isOfficialWorkspace) {
    navItems = OFFICIAL_NAV;
    workspaceTitle = 'Matchday Desk';
  } else if (isAdminWorkspace) {
    navItems = ADMIN_NAV;
    workspaceTitle = 'NSFC Operations';
  }

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <NavLink to="/" className="back-link" title="Return to Public View">
              <ChevronLeft size={20} />
            </NavLink>
            <span className="brand-text">{workspaceTitle}</span>
          </div>

          {/* If Team Desk, show team badge & coach info */}
          {isTeamWorkspace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', width: '100%', marginTop: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>{profile.logo}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {profile.name}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--nova-orange)', fontWeight: 600 }}>
                  Verified Coach
                </span>
              </div>
            </div>
          )}

          {/* If Matchday Desk, show official referee badge */}
          {isOfficialWorkspace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', width: '100%', marginTop: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>🏅</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  Referee James
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--nova-orange)', fontWeight: 600 }}>
                  FIFA / FKF Match Official
                </span>
              </div>
            </div>
          )}

          {/* If Admin Control, show NSFC Council Administration badge */}
          {isAdminWorkspace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'var(--pitch-black)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', width: '100%', marginTop: '4px' }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--nova-orange)' }}>⚡</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', color: 'var(--stadium-white)' }}>
                  NSFC Governance
                </strong>
                <span style={{ fontSize: '0.68rem', color: 'var(--nova-orange)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  NovaSport Football Council
                </span>
              </div>
            </div>
          )}

          <div style={{ width: '100%', marginTop: '6px' }}>
            <RoleSelector />
          </div>
        </div>

        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {React.cloneElement(item.icon, { size: 20 })} 
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with notices button & public link */}
        <div style={{ marginTop: 'auto', padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isTeamWorkspace && (
            <button
              onClick={() => setShowNoticesModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--pitch-black)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--stadium-white)',
                cursor: 'pointer',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={16} color="var(--nova-orange)" />
                <span>Team Bulletins</span>
              </div>
              {unreadCount > 0 && (
                <span style={{ background: 'var(--nova-orange)', color: '#000', borderRadius: 'var(--radius-full)', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              padding: '4px 8px'
            }}
          >
            <ExternalLink size={14} /> NovaSport Public View
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="mobile-header" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NavLink to="/" className="back-link-mobile" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} title="Exit to Public View">
              <ChevronLeft size={24} />
            </NavLink>
            {isTeamWorkspace && <span style={{ fontSize: '1.2rem' }}>{profile.logo}</span>}
            {isOfficialWorkspace && <span style={{ fontSize: '1.2rem' }}>🏅</span>}
            <span className="brand-text" style={{ fontSize: '1.15rem' }}>{workspaceTitle}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Top Navbar notices bell icon */}
            {isTeamWorkspace && (
              <button 
                onClick={() => setShowNoticesModal(true)}
                style={{
                  position: 'relative', 
                  background: 'transparent',
                  border: 'none',
                  color: unreadCount > 0 ? 'var(--nova-orange)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title="Team Notices"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--nova-orange)'
                  }} />
                )}
              </button>
            )}
            <RoleSelector compact={true} />
          </div>
        </header>

        <div className="content-scroll">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="mobile-bottom-nav" 
        style={{ 
          display: 'flex', 
          justifyContent: isAdminWorkspace ? 'flex-start' : 'space-around', 
          overflowX: isAdminWorkspace ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
          gap: isAdminWorkspace ? '4px' : '0'
        }}
      >
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{ 
              minWidth: isAdminWorkspace ? '76px' : 0, 
              flex: isAdminWorkspace ? '0 0 auto' : 1, 
              padding: '8px 4px',
              textAlign: 'center'
            }}
          >
            {React.cloneElement(item.icon, { size: 22 })}
            <span style={{ fontSize: '10px', marginTop: '3px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Team Notices Modal when triggered from header */}
      {showNoticesModal && (
        <TeamNoticesModal
          teamId={currentTeamId}
          onClose={() => setShowNoticesModal(false)}
        />
      )}
    </div>
  );
}
