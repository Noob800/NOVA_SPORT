import { useState } from 'react';
import { X, Dumbbell } from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { TrainingObjective } from '../../../services/teamDeskStore';

interface ScheduleTrainingModalProps {
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleTrainingModal({ teamId, onClose, onSuccess }: ScheduleTrainingModalProps) {
  const [date, setDate] = useState('2026-10-14');
  const [time, setTime] = useState('08:00');
  const [duration, setDuration] = useState(90);
  const [venue, setVenue] = useState('Campus Complex Pitch B');
  const [objective, setObjective] = useState<TrainingObjective>('Tactical Shape & Pressing');
  const [planNotes, setPlanNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    teamDeskStore.scheduleTraining({
      teamId,
      date,
      time,
      durationMinutes: duration,
      venue,
      objective,
      planNotes,
      status: 'SCHEDULED'
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 94, 0, 0.15)', color: 'var(--nova-orange)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Schedule Training Session</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Squad Performance & Conditioning</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Session Date</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-input"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  step="15"
                  className="form-input"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Venue / Pitch</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Main Stadium / Pitch B"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Training Objective</label>
              <select
                className="form-select"
                value={objective}
                onChange={e => setObjective(e.target.value as TrainingObjective)}
              >
                <option value="Tactical Shape & Pressing">Tactical Shape & Pressing</option>
                <option value="Conditioning & High Intensity">Conditioning & High Intensity</option>
                <option value="Set Pieces & Penalty Drills">Set Pieces & Penalty Drills</option>
                <option value="Finishing & Phase of Play">Finishing & Phase of Play</option>
                <option value="Recovery & Light Session">Recovery & Light Session</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Training Plan & Drill Notes</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Warm-up drills, small-sided games, key squad groups..."
                value={planNotes}
                onChange={e => setPlanNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--stadium-white)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="login-button"
              style={{ padding: '8px 20px', fontWeight: 600 }}
            >
              Confirm & Notify Squad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
