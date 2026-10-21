import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">For university students with exams coming up</p>
        <h1>Turn your lecture notes into flashcards.</h1>
        <p className="lead">
          CramCards helps you write a question for every key idea in your notes, so you review a
          little each day before exams instead of cramming the night before.
        </p>
        <Link href="/signup" className="btn btn-large">Sign up, it&apos;s free</Link>
        <p className="muted small">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>

      <section className="features" aria-label="How it works">
        <div className="feature">
          <span className="feature-num" aria-hidden="true">1</span>
          <h2>Write the question</h2>
          <p>Read your notes and type one short question per concept.</p>
        </div>
        <div className="feature">
          <span className="feature-num" aria-hidden="true">2</span>
          <h2>Add the answer</h2>
          <p>Optional: add the answer now, or fill it in later.</p>
        </div>
        <div className="feature">
          <span className="feature-num" aria-hidden="true">3</span>
          <h2>Review anywhere</h2>
          <p>Your private deck is saved to your account, on your laptop or phone.</p>
        </div>
      </section>
    </>
  );
}
