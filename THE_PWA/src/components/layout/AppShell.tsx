import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Trophy, Users, LayoutDashboard } from 'lucide-react';
import './AppShell.css';

export function AppShell() {
  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/favicon.svg" alt="NovaSport" className="brand-logo" />
          <span className="brand-text">NOVASPORT</span>
        </div>
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Home
          </NavLink>
          <NavLink to="/competitions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Trophy size={20} /> Competitions
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Teams
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> NSFC Admin
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="mobile-header">
          <img src="/favicon.svg" alt="NovaSport" className="mobile-brand-logo" />
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
        <NavLink to="/competitions" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Trophy size={24} />
          <span>Competitions</span>
        </NavLink>
        <NavLink to="/teams" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={24} />
          <span>Teams</span>
        </NavLink>
      </nav>
    </div>
  );
}
