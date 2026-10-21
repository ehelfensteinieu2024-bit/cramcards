import Link from 'next/link';

const STEPS = [
  { title: 'Write the question', text: 'After each lecture, turn every key idea into one short question.' },
  { title: 'Add the answer', text: 'Add the answer now, or fill it in later. Sort cards by subject.' },
  { title: 'Review before exams', text: 'Go through your cards one at a time and check what you remember.' },
];

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">For university students</p>
        <h1>Turn your lecture notes into flashcards, built for university students</h1>
        <p className="lead">
          Review a little after each lecture instead of cramming the night before exams.
        </p>
        <Link href="/signup" className="btn btn-large">Sign up, it&apos;s free</Link>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-num" aria-hidden="true">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="privacy-note">
        <span aria-hidden="true">🔒</span> Your cards are private. Only you can see them.
      </p>
    </>
  );
}
