import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { adminStore } from '../../services/adminStore';

export function NewsArticle() {
  const { id } = useParams();
  const [, setTick] = useState(0);

  useEffect(() => {
    return adminStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const announcements = adminStore.getAnnouncements();
  const article = announcements.find(n => n.id === id) || announcements[0];

  if (!article) {
    return (
      <div className="home-container" style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-6)' }}>
        <button onClick={() => window.history.back()} className="icon-button"><ChevronLeft size={20} /></button>
        <h2 style={{ marginTop: 'var(--space-4)' }}>Announcement Not Found</h2>
        <p className="text-muted">The requested announcement could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="home-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button onClick={() => window.history.back()} className="icon-button"><ChevronLeft size={20} /></button>
      </div>

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <span className="news-category" style={{ color: 'var(--color-primary-orange, #FF6A00)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          {article.category || 'Official League Communication'}
        </span>
        <h1 style={{ fontSize: '2.5rem', margin: 'var(--space-2) 0', lineHeight: 1.2 }}>{article.title}</h1>
        <p className="text-muted tabular-nums">
          {article.publishedAt ? article.publishedAt.split('T')[0] : 'Today'} • Published by {article.authorName || 'League Secretariat'}
        </p>
      </header>

      <div style={{ width: '100%', height: '320px', backgroundImage: 'url(https://images.unsplash.com/photo-1518605368461-1e1e11405122?auto=format&fit=crop&w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius-lg, 8px)', marginBottom: 'var(--space-6)' }} />

      <div className="article-content" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--color-stadium-white, #F5F5F2)' }}>
        {article.summary && (
          <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: 'var(--space-4)', color: 'var(--color-stadium-white, #F5F5F2)' }}>
            {article.summary}
          </p>
        )}
        <div style={{ whiteSpace: 'pre-line' }}>
          {article.body || 'No further text provided for this official dispatch.'}
        </div>
      </div>
    </div>
  );
}
