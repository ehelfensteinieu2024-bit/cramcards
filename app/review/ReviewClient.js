'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sortSubjects } from '@/lib/subjects';

const ALL = 'all';

export default function ReviewClient({ cards, subjects, initialSubject, loadError }) {
  const sorted = sortSubjects(subjects);
  const [filter, setFilter] = useState(() =>
    sorted.some((s) => s.id === initialSubject) ? initialSubject : ALL
  );
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const deck = filter === ALL ? cards : cards.filter((c) => c.subject_id === filter);
  const card = deck[index];
  const subjectName = Object.fromEntries(sorted.map((s) => [s.id, s.name]));

  function go(to) {
    setIndex(to);
    setShowAnswer(false);
  }

  function changeFilter(id) {
    setFilter(id);
    go(0);
  }

  return (
    <div className="app-page">
      <div className="page-head">
        <h1>Review</h1>
        <Link href="/app" className="btn btn-secondary">Back to my cards</Link>
      </div>

      <label className="field review-filter">
        <span>Subject</span>
        <select value={filter} onChange={(e) => changeFilter(e.target.value)}>
          <option value={ALL}>All subjects ({cards.length})</option>
          {sorted.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({cards.filter((c) => c.subject_id === s.id).length})
            </option>
          ))}
        </select>
      </label>

      {loadError && <p className="error" role="alert">Sorry, your cards could not be loaded. {loadError}</p>}

      {!card ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🗂️</span>
          <p className="empty-title">No cards to review yet</p>
          <p className="muted">
            {cards.length === 0 ? 'Add your first flashcard, then come back here.' : 'This subject has no cards yet.'}
          </p>
          <Link href="/app" className="btn">Add a flashcard</Link>
        </div>
      ) : (
        <>
          <p className="review-counter" aria-live="polite">
            {index + 1} of {deck.length}
          </p>

          <article className="review-card">
            {subjectName[card.subject_id] && <p className="flashcard-subject">{subjectName[card.subject_id]}</p>}
            <p className="review-q">{card.question}</p>
            {showAnswer ? (
              <p className="review-a">{card.answer || <em>No answer yet. Add one on the My cards page.</em>}</p>
            ) : (
              <button type="button" className="btn" onClick={() => setShowAnswer(true)}>
                Show answer
              </button>
            )}
          </article>

          <div className="review-nav">
            <button type="button" className="btn btn-secondary" onClick={() => go(index - 1)} disabled={index === 0}>
              ← Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => go(index + 1)}
              disabled={index === deck.length - 1}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
