'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CardsClient({ initialCards, loadError }) {
  const [cards, setCards] = useState(initialCards);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(loadError);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q) {
      setError('Type a question first.');
      return;
    }
    setError('');
    setSaving(true);

    const { data, error } = await createClient()
      .from('cards')
      .insert({ question: q, answer: answer.trim() })
      .select('id, question, answer, created_at')
      .single();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCards((prev) => [data, ...prev]);
    setQuestion('');
    setAnswer('');
  }

  async function handleDelete(id) {
    const { error } = await createClient().from('cards').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function toggle(id) {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="app-page">
      <h1>My flashcards</h1>

      <form onSubmit={handleSubmit} className="card-form stack">
        <label className="field">
          <span>Question</span>
          <input
            type="text"
            name="question"
            placeholder="e.g. What is opportunity cost?"
            maxLength={500}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            data-testid="core-input"
          />
        </label>
        <label className="field">
          <span>Answer <span className="muted">(optional)</span></span>
          <textarea
            name="answer"
            rows={3}
            placeholder="You can add it later."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={saving} data-testid="core-submit">
          {saving ? 'Saving…' : 'Save card'}
        </button>
      </form>

      <h2 className="list-title">
        {cards.length} {cards.length === 1 ? 'card' : 'cards'}
      </h2>

      {cards.length === 0 ? (
        <p className="muted empty">No cards yet. Write your first question above.</p>
      ) : (
        <ul className="card-list">
          {cards.map((card) => (
            <li key={card.id} className="flashcard" data-testid="core-item">
              <p className="flashcard-q">{card.question}</p>
              {revealed[card.id] && (
                <p className="flashcard-a">{card.answer || <em className="muted">No answer yet.</em>}</p>
              )}
              <div className="flashcard-actions">
                <button type="button" className="btn btn-small btn-secondary" onClick={() => toggle(card.id)}>
                  {revealed[card.id] ? 'Hide answer' : 'Show answer'}
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-ghost"
                  onClick={() => handleDelete(card.id)}
                  aria-label={`Delete card: ${card.question}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
