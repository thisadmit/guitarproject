import { useEffect, useMemo, useState } from "react";
import { trainingStorage } from "../../services/storage";
import type { TrainingRecord } from "../../types/records";
import type { AppRoute } from "../../types/routes";
import { getTrainingStats } from "../../utils/trainingStats";

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const stats = useMemo(() => getTrainingStats(records), [records]);
  const recentRecords = records.slice(0, 5);

  useEffect(() => {
    let isMounted = true;

    void trainingStorage.getRecords().then((nextRecords) => {
      if (isMounted) {
        setRecords(nextRecords);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page-stack dashboard-page" aria-label="Dashboard">
      <div className="mode-hero dashboard-hero">
        <div>
          <h2>Dashboard</h2>
          <strong>Track your progress and continue your training</strong>
          <p>
            Review recent practice results, jump back into core modes, and keep
            your learning flow centered.
          </p>
        </div>
      </div>

      <section className="dashboard-section quick-start-section" aria-label="Quick start">
        <div className="section-heading">
          <h2>Quick Start</h2>
          <span>Continue</span>
        </div>
        <div className="quick-start-grid">
          <button className="dashboard-action-card" type="button" onClick={() => onNavigate("/practice")}>
            <span>Practice</span>
            <strong>Start Practice</strong>
            <p>Work with visible scale and box guidance.</p>
          </button>
          <button className="dashboard-action-card" type="button" onClick={() => onNavigate("/training")}>
            <span>Training</span>
            <strong>Start Training</strong>
            <p>Test note finding on a hidden fretboard.</p>
          </button>
          <button className="dashboard-action-card" type="button" onClick={() => onNavigate("/tuner")}>
            <span>Tuner</span>
            <strong>Open Tuner</strong>
            <p>Check pitch with live microphone input.</p>
          </button>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-heading">
            <h2>Recent Activity</h2>
            <span>{records.length} sessions</span>
          </div>
          {recentRecords.length > 0 ? (
            <div className="recent-activity-list">
              {recentRecords.map((record) => (
                <article className="recent-activity-card" key={record.id}>
                  <strong>{formatTrainingType(record.trainingType)}</strong>
                  <p>
                    {[record.key, record.scale, record.box].filter(Boolean).join(" / ") ||
                      "Training session"}
                  </p>
                  <dl>
                    <div>
                      <dt>Accuracy</dt>
                      <dd>{record.accuracy}%</dd>
                    </div>
                    <div>
                      <dt>Time</dt>
                      <dd>{record.durationSec}s</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <strong>No training records yet.</strong>
              <p>Start your first training.</p>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <h2>Stats</h2>
            <span>Local</span>
          </div>
          <div className="dashboard-stats-grid">
            <div>
              <span>Total Sessions</span>
              <strong>{stats.totalSessions}</strong>
            </div>
            <div>
              <span>Average Accuracy</span>
              <strong>{stats.averageAccuracy}%</strong>
            </div>
            <div>
              <span>Best Streak</span>
              <strong>{stats.bestStreak}</strong>
            </div>
            <div>
              <span>Completed Problems</span>
              <strong>{stats.completedProblems}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-section dashboard-placeholder">
          <div className="section-heading">
            <h2>Weak Points</h2>
            <span>Later</span>
          </div>
          <p>Targeted weak-point analysis will appear after training records are saved.</p>
        </div>
        <div className="dashboard-section dashboard-placeholder">
          <div className="section-heading">
            <h2>Recommended Training</h2>
            <span>Later</span>
          </div>
          <p>Personalized drills will be suggested from your future session history.</p>
        </div>
      </section>
    </section>
  );
}

function formatTrainingType(trainingType: TrainingRecord["trainingType"]): string {
  switch (trainingType) {
    case "scale-drill":
      return "Scale Drill";
    case "chord-tone":
      return "Chord Tone";
    case "lick":
      return "Lick";
  }
}
