import { User, ChevronRight, LogIn, LogOut, Shield, Award, Users, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './MyNova.css';
import { FanView } from './FanView';
import { PlayerView } from './PlayerView';
import { RoleSelector } from './RoleSelector';

export function MyNova() {
  const { user, login, logout, switchActiveRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  if (!user) {
    return (
      <div className="mynova-container">
        <section className="profile-header">
          <div className="profile-avatar">
            <User size={40} className="icon-orange" />
          </div>
          <div>
            <h1 className="profile-name">Guest Fan</h1>
            <p className="profile-subtitle">Create an account or select an experience to explore NovaSport</p>
          </div>
        </section>

        {inviteCode && (
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
              <Mail size={18} /> Official Team Invitation Code: {inviteCode}
            </div>
            <p style={{ margin: '6px 0 12px', fontSize: '0.85rem', color: 'var(--stadium-white)' }}>
              You have been invited by your team coach to join the squad roster with a reserved shirt number. Sign in to create your player profile and claim your official spot.
            </p>
            <button
              onClick={() => login('PLAYER')}
              className="login-button"
              style={{ background: '#38bdf8', color: '#000', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Sign In as Invited Player ➜
            </button>
          </div>
        )}

        <div className="auth-panel card-panel">
          <div className="panel-header" style={{ marginBottom: 'var(--space-2)' }}>
            <h3><LogIn size={18} /> Sign In / Select Role Experience</h3>
          </div>
          <p className="workspace-description" style={{ marginBottom: 'var(--space-4)' }}>
            Switch into any of the 4 primary roles to experience the personalized feeds, team management, or official match operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <button 
              onClick={() => login('REGISTERED_FAN')} 
              className="login-button"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textAlign: 'left' }}
            >
              <div style={{ background: 'var(--pitch-black)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <User size={20} color="var(--stadium-white)" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Fan View</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alex Fan • Personalized feed</span>
              </div>
            </button>

            <button 
              onClick={() => login('PLAYER')} 
              className="login-button"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textAlign: 'left' }}
            >
              <div style={{ background: 'var(--pitch-black)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <Users size={20} color="#38bdf8" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Player View</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brian Otieno #10 • Verified</span>
              </div>
            </button>

            <button 
              onClick={() => { login('COACH'); navigate('/workspace/team/overview'); }} 
              className="login-button"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textAlign: 'left' }}
            >
              <div style={{ background: 'var(--pitch-black)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <Shield size={20} color="#34d399" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Coach Desk</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coach Marcus • Meru Warriors</span>
              </div>
            </button>

            <button 
              onClick={() => { login('OFFICIAL'); navigate('/workspace/official/matches'); }} 
              className="login-button" 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textAlign: 'left', border: '1px solid var(--nova-orange)', background: 'rgba(255,94,0,0.1)' }}
            >
              <div style={{ background: 'var(--nova-orange)', padding: '8px', borderRadius: 'var(--radius-md)', color: '#000' }}>
                <Award size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--nova-orange)' }}>Matchday Desk</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--stadium-white)' }}>Referee James • Match Official</span>
              </div>
            </button>
          </div>
        </div>

        {/* Guest View shows FanView */}
        <FanView isGuest={true} />
      </div>
    );
  }

  return (
    <div className="mynova-container">
      <section className="profile-header">
        <div className="profile-avatar">
          <User size={40} className="icon-orange" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-subtitle">NovaSport • {user.activeRole.replace('_', ' ')}</p>
        </div>
        
        <RoleSelector />
      </section>

      {inviteCode && user.activeRole !== 'PLAYER' && (
        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
            <Mail size={18} /> Official Team Invitation Pending: {inviteCode}
          </div>
          <p style={{ margin: '6px 0 12px', fontSize: '0.85rem', color: 'var(--stadium-white)' }}>
            You have received an official team registration invitation. Switch to Player View to claim your reserved jersey and roster spot.
          </p>
          <button
            onClick={() => switchActiveRole('PLAYER')}
            className="login-button"
            style={{ background: '#38bdf8', color: '#000', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Switch to Player View & Claim Spot ➜
          </button>
        </div>
      )}

      {/* 4-Role Workspace Quick Switcher Bar */}
      <div className="card-panel" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="panel-header" style={{ marginBottom: '10px' }}>
          <h3>Available Roles & Workspaces</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div 
            onClick={() => { switchActiveRole('REGISTERED_FAN'); }}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: user.activeRole === 'REGISTERED_FAN' ? 'rgba(255,94,0,0.15)' : 'var(--pitch-black)',
              border: user.activeRole === 'REGISTERED_FAN' ? '1px solid var(--nova-orange)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <User size={20} color="var(--stadium-white)" />
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', color: user.activeRole === 'REGISTERED_FAN' ? 'var(--nova-orange)' : 'var(--stadium-white)' }}>
                Fan View {user.activeRole === 'REGISTERED_FAN' && '✓'}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Public Feed & Following</span>
            </div>
          </div>

          <div 
            onClick={() => { switchActiveRole('PLAYER'); }}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: user.activeRole === 'PLAYER' ? 'rgba(56,189,248,0.15)' : 'var(--pitch-black)',
              border: user.activeRole === 'PLAYER' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Users size={20} color="#38bdf8" />
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', color: user.activeRole === 'PLAYER' ? '#38bdf8' : 'var(--stadium-white)' }}>
                Player View {user.activeRole === 'PLAYER' && '✓'}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Brian Otieno #10</span>
            </div>
          </div>

          <div 
            onClick={() => { switchActiveRole('COACH'); navigate('/workspace/team/overview'); }}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: user.activeRole === 'COACH' ? 'rgba(52,211,153,0.15)' : 'var(--pitch-black)',
              border: user.activeRole === 'COACH' ? '1px solid #34d399' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Shield size={20} color="#34d399" />
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', color: user.activeRole === 'COACH' ? '#34d399' : 'var(--stadium-white)' }}>
                Coach Desk {user.activeRole === 'COACH' && '✓'}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Meru Warriors</span>
            </div>
          </div>

          <div 
            onClick={() => { switchActiveRole('OFFICIAL'); navigate('/workspace/official/matches'); }}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: user.activeRole === 'OFFICIAL' ? 'rgba(255,94,0,0.15)' : 'var(--pitch-black)',
              border: user.activeRole === 'OFFICIAL' ? '1px solid var(--nova-orange)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Award size={20} color="var(--nova-orange)" />
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', color: user.activeRole === 'OFFICIAL' ? 'var(--nova-orange)' : 'var(--stadium-white)' }}>
                Matchday Desk {user.activeRole === 'OFFICIAL' && '✓'}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Referee James (Official)</span>
            </div>
          </div>
        </div>
      </div>

      {user.activeRole === 'COACH' && (
        <div className="card-panel" style={{ borderLeft: '4px solid #34d399', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
              <Shield size={16} /> ACTIVE WORKSPACE: TEAM DESK
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Managing squad tactics, lineups, and match preparations for Meru Warriors.
            </p>
          </div>
          <Link to="/workspace/team/overview" className="login-button" style={{ background: '#34d399', color: '#000', fontWeight: 700, textDecoration: 'none' }}>
            Open Team Desk ➜
          </Link>
        </div>
      )}

      {user.activeRole === 'OFFICIAL' && (
        <div className="card-panel" style={{ borderLeft: '4px solid var(--nova-orange)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--nova-orange)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Award size={16} /> ACTIVE WORKSPACE: MATCHDAY DESK
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Operating assigned fixtures, live pitchside scorekeeper, and official reports.
            </p>
          </div>
          <Link to="/workspace/official/matches" className="login-button" style={{ background: 'var(--nova-orange)', color: '#000', fontWeight: 700, textDecoration: 'none' }}>
            Open Matchday Desk ➜
          </Link>
        </div>
      )}

      {user.activeRole === 'PLAYER' && <PlayerView />}
      {(user.activeRole === 'REGISTERED_FAN' || user.activeRole === 'GUEST') && <FanView isGuest={false} />}

      <div className="settings-panel card-panel" style={{ marginTop: 'var(--space-6)' }}>
        <div className="panel-header">
          <h3>Settings & Preferences</h3>
        </div>
        <ul className="workspace-list">
          <li>
            <button className="workspace-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="workspace-info">
                <span className="workspace-title">Account Details</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>
          </li>
          <li>
            <button className="workspace-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="workspace-info">
                <span className="workspace-title">Notification Preferences</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>
          </li>
          <li>
            <button onClick={logout} className="workspace-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderColor: 'var(--border-subtle)' }}>
              <div className="workspace-icon" style={{ padding: '8px', color: 'var(--text-muted)', backgroundColor: 'transparent' }}><LogOut size={20} /></div>
              <div className="workspace-info">
                <span className="workspace-title" style={{ color: 'var(--text-muted)' }}>Sign Out</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
