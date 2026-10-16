import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';

export type UserRole = 'GUEST' | 'REGISTERED_FAN' | 'PLAYER' | 'COACH' | 'OFFICIAL' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email?: string;
  roles: UserRole[];
  activeRole: UserRole;
  followedTeams: string[];
  linkedPlayerId?: string; // Links a user to a specific player profile
  assignedTeamId?: string; // Coach / Manager assigned team
  managedTeamIds?: string[]; // Multiple teams if coach manages more than one
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  switchActiveRole: (role: UserRole) => void;
  switchAssignedTeam: (teamId: string) => void;
  signInWithSupabase: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with localStorage persistence if available, ensuring all primary roles
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('novasport_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u) {
          return {
            ...u,
            roles: ['REGISTERED_FAN', 'PLAYER', 'COACH', 'OFFICIAL', 'ADMIN']
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Default active administrative demo session mapped to real database entities
    return {
      id: 'usr-admin-01',
      name: 'League Administrator',
      roles: ['REGISTERED_FAN', 'PLAYER', 'COACH', 'OFFICIAL', 'ADMIN'],
      activeRole: 'ADMIN',
      followedTeams: ['t1', 't2', 't4'],
      linkedPlayerId: 'p1',
      assignedTeamId: 't1',
      managedTeamIds: ['t1', 't2']
    };
  });

  // Check Supabase session on startup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const liveUser: User = {
                id: profile.id,
                name: profile.full_name || session.user.email?.split('@')[0] || 'Member',
                email: session.user.email,
                roles: profile.roles || ['REGISTERED_FAN', 'PLAYER', 'COACH', 'OFFICIAL', 'ADMIN'],
                activeRole: profile.active_role || 'ADMIN',
                followedTeams: profile.followed_teams || ['t1', 't2'],
                linkedPlayerId: profile.linked_player_id || 'p1',
                assignedTeamId: profile.assigned_team_id || 't1',
                managedTeamIds: profile.managed_team_ids || ['t1']
              };
              setUser(liveUser);
              localStorage.setItem('novasport_auth_user', JSON.stringify(liveUser));
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // Retain current session or clear if explicitly logged out
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (role: UserRole) => {
    // All primary roles are always accessible for seamless switching across canonical DB entities
    const roles: UserRole[] = ['REGISTERED_FAN', 'PLAYER', 'COACH', 'OFFICIAL', 'ADMIN'];
    
    let userName = 'Alex Fan';
    let playerId: string | undefined = undefined;
    let teamId: string | undefined = undefined;

    if (role === 'GUEST') userName = 'Guest';
    else if (role === 'PLAYER') {
      userName = 'Brian Otieno';
      playerId = 'p1';
      teamId = 't1';
    } else if (role === 'COACH') {
      userName = 'Coach Marcus';
      teamId = 't1';
    } else if (role === 'OFFICIAL') {
      userName = 'Referee James';
    } else if (role === 'ADMIN') {
      userName = 'League Administrator';
      teamId = 't1';
    }

    const newUser: User = {
      id: role === 'PLAYER' ? 'p1' : role === 'OFFICIAL' ? 'off-1' : 'usr-canonical-1',
      name: userName,
      roles: roles,
      activeRole: role,
      followedTeams: role !== 'GUEST' ? ['t1', 't2', 't4'] : [],
      linkedPlayerId: playerId || 'p1',
      assignedTeamId: teamId || 't1',
      managedTeamIds: ['t1', 't2']
    };

    setUser(newUser);
    try {
      localStorage.setItem('novasport_auth_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
  };

  const switchActiveRole = (role: UserRole) => {
    setUser(prev => {
      let userName = prev ? prev.name : 'Alex Fan';
      let playerId = prev?.linkedPlayerId || 'p1';
      let teamId = prev?.assignedTeamId || 't1';

      if (role === 'PLAYER') {
        userName = 'Brian Otieno';
        playerId = 'p1';
        teamId = 't1';
      } else if (role === 'COACH') {
        userName = 'Coach Marcus';
        teamId = 't1';
      } else if (role === 'OFFICIAL') {
        userName = 'Referee James';
      } else if (role === 'ADMIN') {
        userName = 'League Administrator';
      } else if (role === 'REGISTERED_FAN') {
        userName = 'Alex Fan';
      }

      const updated: User = {
        id: prev?.id || 'usr-canonical-1',
        name: userName,
        roles: ['REGISTERED_FAN', 'PLAYER', 'COACH', 'OFFICIAL', 'ADMIN'],
        activeRole: role,
        followedTeams: prev?.followedTeams || ['t1', 't2', 't4'],
        linkedPlayerId: playerId,
        assignedTeamId: teamId,
        managedTeamIds: prev?.managedTeamIds || ['t1', 't2']
      };

      try {
        localStorage.setItem('novasport_auth_user', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      return updated;
    });
  };

  const switchAssignedTeam = (teamId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, assignedTeamId: teamId };
      try {
        localStorage.setItem('novasport_auth_user', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const signInWithSupabase = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setUser(null);
    try {
      localStorage.removeItem('novasport_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchActiveRole, switchAssignedTeam, signInWithSupabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
