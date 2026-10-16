import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import { ChevronDown, Check, User, Shield, Award, Users, ShieldAlert } from 'lucide-react';

interface RoleSelectorProps {
  compact?: boolean;
}

export function RoleSelector({ compact = false }: RoleSelectorProps) {
  const { user, login, switchActiveRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ROLES_LIST: {
    role: UserRole;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    path: string;
  }[] = [
    {
      role: 'REGISTERED_FAN',
      title: 'Fan View',
      subtitle: 'Public feed, followed teams & clubs',
      icon: <User size={18} />,
      color: 'var(--stadium-white)',
      path: '/mynova',
    },
    {
      role: 'PLAYER',
      title: 'Player View',
      subtitle: 'Brian Otieno #10 • Stats & match history',
      icon: <Users size={18} />,
      color: '#38bdf8',
      path: '/mynova',
    },
    {
      role: 'COACH',
      title: 'Coach Desk',
      subtitle: 'Meru Warriors • Squad, tactics & desk',
      icon: <Shield size={18} />,
      color: '#34d399',
      path: '/workspace/team/overview',
    },
    {
      role: 'OFFICIAL',
      title: 'Matchday Desk',
      subtitle: 'Referee James • Live pitchside & reports',
      icon: <Award size={18} />,
      color: 'var(--nova-orange)',
      path: '/workspace/official/matches',
    },
    {
      role: 'ADMIN',
      title: 'Admin Control',
      subtitle: 'League Admin • Central platform control',
      icon: <ShieldAlert size={18} />,
      color: '#ec4899',
      path: '/workspace/admin/overview',
    },
  ];

  const currentRole = user?.activeRole || 'REGISTERED_FAN';
  const activeConfig = ROLES_LIST.find((r) => r.role === currentRole) || ROLES_LIST[0];

  const handleRoleSelect = (item: (typeof ROLES_LIST)[0]) => {
    setIsOpen(false);
    if (!user) {
      login(item.role);
    } else {
      switchActiveRole(item.role);
    }
    navigate(item.path);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch User Role"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '4px' : '8px',
          background: 'var(--pitch-black)',
          border: '1px solid var(--border-subtle)',
          padding: compact ? '5px 8px' : '6px 12px',
          borderRadius: 'var(--radius-full)',
          color: 'var(--stadium-white)',
          cursor: 'pointer',
          fontSize: compact ? '0.75rem' : '0.85rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--nova-orange)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <span style={{ color: activeConfig.color, display: 'flex', alignItems: 'center' }}>
          {activeConfig.icon}
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>{activeConfig.title}</span>
        <ChevronDown size={14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)',
            zIndex: 1000,
            width: '280px',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(0,0,0,0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Select Active Workspace
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
              4 Available
            </span>
          </div>

          <div style={{ padding: '4px 0' }}>
            {ROLES_LIST.map((item) => {
              const isSelected = user ? user.activeRole === item.role : item.role === 'REGISTERED_FAN';

              return (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    background: isSelected ? 'rgba(255,94,0,0.12)' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected ? '3px solid var(--nova-orange)' : '3px solid transparent',
                    color: 'var(--stadium-white)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--pitch-black)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong
                        style={{
                          fontSize: '0.86rem',
                          color: isSelected ? 'var(--nova-orange)' : 'var(--stadium-white)',
                        }}
                      >
                        {item.title}
                      </strong>
                      {item.role === 'OFFICIAL' && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(255,94,0,0.2)',
                            color: 'var(--nova-orange)',
                            fontWeight: 700,
                          }}
                        >
                          LIVE
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px',
                      }}
                    >
                      {item.subtitle}
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ color: 'var(--nova-orange)', flexShrink: 0 }}>
                      <Check size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
