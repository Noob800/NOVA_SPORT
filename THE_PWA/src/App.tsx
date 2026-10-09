import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { CompetitionHub } from './pages/CompetitionHub';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="competitions" element={<CompetitionHub />} />
          <Route path="competitions/:id" element={<CompetitionHub />} />
          <Route path="teams" element={<div className="p-8">Teams View (WIP)</div>} />
          <Route path="admin" element={<div className="p-8">Admin Dashboard (WIP)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
