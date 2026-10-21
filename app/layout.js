import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'CramCards: turn lecture notes into flashcards',
  description:
    'CramCards helps university students turn lecture notes into flashcards so they can review before exams instead of cramming.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
