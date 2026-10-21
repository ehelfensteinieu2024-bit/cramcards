'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const CARD_FIELDS = 'id, question, answer, subject_id, created_at';
const ALL = 'all';

// "General" first, then A–Z.
function sortSubjects(list) {
  return [...list].sort((a, b) => {
    const ag = a.name.toLowerCase() === 'general';
    const bg = b.name.toLowerCase() === 'general';
    if (ag !== bg) return ag ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export default function CardsClient({ initialCards, initialSubjects, loadError }) {
  const [cards, setCards] = useState(initialCards);
  const [subjects, setSubjects] = useState(() => sortSubjects(initialSubjects));
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  // '' = no choice: the database puts the card in "General".
  const [cardSubject, setCardSubject] = useState('');
  const [filter, setFilter] = useState(ALL);
  const [newSubject, setNewSubject] = useState('');
  const [error, setError] = useState(loadError);
  const [subjectError, setSubjectError] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [revealed, setRevealed] = useState({});

  const subjectName = Object.fromEntries(subjects.map((s) => [s.id, s.name]));
  const visibleCards = filter === ALL ? cards : cards.filter((c) => c.subject_id === filter);

  async function reloadSubjects() {
    const { data } = await createClient().from('subjects').select('id, name');
    if (data) setSubjects(sortSubjects(data));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q) {
      setError('Type a question first.');
      return;
    }
    setError('');
    setSaving(true);

    const row = { question: q, answer: answer.trim() };
    if (cardSubject) row.subject_id = cardSubject;

    const { data, error } = await createClient()
      .from('cards')
      .insert(row)
      .select(CARD_FIELDS)
      .single();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCards((prev) => [data, ...prev]);
    setQuestion('');
    setAnswer('');
    // First card ever: the database just created "General", so fetch it.
    if (!subjectName[data.subject_id]) reloadSubjects();
  }

  async function handleAddSubject(e) {
    e.preventDefault();
    const name = newSubject.trim();
    if (!name) {
      setSubjectError('Type a subject name first.');
      return;
    }
    setSubjectError('');
    setAddingSubject(true);

    const { data, error } = await createClient()
      .from('subjects')
      .insert({ name })
      .select('id, name')
      .single();

    setAddingSubject(false);
    if (error) {
      setSubjectError(error.code === '23505' ? `You already have a subject called "${name}".` : error.message);
      return;
    }
    setSubjects((prev) => sortSubjects([...prev, data]));
    setNewSubject('');
    selectFilter(data.id);
  }

  // Picking a subject in the filter also makes it the default for new cards.
  function selectFilter(id) {
    setFilter(id);
    setCardSubject(id === ALL ? '' : id);
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

  const generalId = subjects.find((s) => s.name.toLowerCase() === 'general')?.id ?? '';

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
        <label className="field">
          <span>Subject <span className="muted">(optional)</span></span>
          <select name="subject" value={cardSubject || generalId} onChange={(e) => setCardSubject(e.target.value)}>
            {!generalId && <option value="">General</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={saving} data-testid="core-submit">
          {saving ? 'Saving…' : 'Save card'}
        </button>
      </form>

      <section className="subjects" aria-labelledby="subjects-title">
        <h2 id="subjects-title" className="list-title">Subjects</h2>
        <div className="subject-filter" role="group" aria-label="Filter cards by subject">
          <button
            type="button"
            className="chip"
            aria-pressed={filter === ALL}
            onClick={() => selectFilter(ALL)}
          >
            All <span className="chip-count">{cards.length}</span>
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              className="chip"
              aria-pressed={filter === s.id}
              onClick={() => selectFilter(s.id)}
            >
              {s.name} <span className="chip-count">{cards.filter((c) => c.subject_id === s.id).length}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleAddSubject} className="subject-form">
          <label className="field subject-field">
            <span className="visually-hidden">New subject name</span>
            <input
              type="text"
              name="subject-name"
              placeholder="New subject, e.g. Statistics"
              maxLength={40}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={addingSubject}>
            {addingSubject ? 'Adding…' : 'Add subject'}
          </button>
        </form>
        {subjectError && <p className="error" role="alert">{subjectError}</p>}
      </section>

      <h2 className="list-title">
        {visibleCards.length} {visibleCards.length === 1 ? 'card' : 'cards'}
        {filter !== ALL && subjectName[filter] && <> in {subjectName[filter]}</>}
      </h2>

      {visibleCards.length === 0 ? (
        <p className="muted empty">
          {cards.length === 0 ? 'No cards yet. Write your first question above.' : 'No cards in this subject yet.'}
        </p>
      ) : (
        <ul className="card-list">
          {visibleCards.map((card) => (
            <li key={card.id} className="flashcard" data-testid="core-item">
              {subjectName[card.subject_id] && <p className="flashcard-subject">{subjectName[card.subject_id]}</p>}
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
