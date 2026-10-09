import React from 'react';
import { Calendar, Flame, ChevronRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockLiveMatches, mockUpcomingMatches, mockNews, mockRecentResults } from '../mockData';
import './Home.css';

export function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">MORE THAN<br/><span className="text-orange">FOOTBALL</span></h1>
        <p className="subtitle">The digital home of KeMU Super League Season 8</p>
      </section>

      <div className="dashboard-grid">
        {/* Live & Upcoming Matches Column */}
        <div className="dashboard-column">
          <div className="section-header">
            <h2><Flame className="icon-orange" size={24} /> Match Center</h2>
          </div>
          
          {mockLiveMatches.length > 0 && (
            <div className="live-matches">
              {mockLiveMatches.map(match => (
                <div key={match.id} className="match-card live-card">
                  <div className="card-header">
                    <span className="live-badge">LIVE</span>
                    <span className="match-time tabular-nums">{match.minute}</span>
                  </div>
                  <div className="match-scoreboard">
                    <div className="team">
                      <span className="team-logo">{match.homeTeam.logo}</span>
                      <span className="team-name">{match.homeTeam.shortName}</span>
                    </div>
                    <div className="score-wrapper">
                      <span className="score tabular-nums">{match.homeScore}</span>
                      <span className="score-divider">-</span>
                      <span className="score tabular-nums">{match.awayScore}</span>
                    </div>
                    <div className="team">
                      <span className="team-logo">{match.awayTeam.logo}</span>
                      <span className="team-name">{match.awayTeam.shortName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="upcoming-matches card-panel">
            <div className="panel-header">
              <h3><Calendar size={18} /> Upcoming</h3>
              <Link to="/competitions" className="view-all">Full Fixtures <ChevronRight size={16}/></Link>
            </div>
            <ul className="match-list">
              {mockUpcomingMatches.map(match => (
                <li key={match.id} className="match-list-item">
                  <div className="match-teams">
                    <span>{match.homeTeam.name}</span>
                    <span className="vs">vs</span>
                    <span>{match.awayTeam.name}</span>
                  </div>
                  <div className="match-meta">
                    <span className="match-date">{match.date}</span>
                    <span className="match-time tabular-nums">{match.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="recent-results card-panel">
            <div className="panel-header">
              <h3>Recent Results</h3>
            </div>
            <ul className="match-list">
              {mockRecentResults.map(match => (
                <li key={match.id} className="match-list-item result-item">
                  <div className="match-teams">
                    <span className={match.homeScore > match.awayScore ? 'winner' : ''}>{match.homeTeam.shortName}</span>
                    <span className="result-score tabular-nums">{match.homeScore} - {match.awayScore}</span>
                    <span className={match.awayScore > match.homeScore ? 'winner' : ''}>{match.awayTeam.shortName}</span>
                  </div>
                  <span className="status-badge">FT</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* News & Updates Column */}
        <div className="dashboard-column">
          <div className="section-header">
            <h2><Newspaper size={24} /> Latest News</h2>
          </div>
          
          <div className="news-feed">
            {mockNews.map(news => (
              <article key={news.id} className="news-card">
                <div className="news-image" style={{ backgroundImage: `url(${news.image})` }}>
                  <span className="news-category">{news.category}</span>
                </div>
                <div className="news-content">
                  <h3 className="news-title">{news.title}</h3>
                  <span className="news-date tabular-nums">{news.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
