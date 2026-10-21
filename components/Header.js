import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from './LogoutButton';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span aria-hidden="true">🗂️</span> CramCards
        </Link>
        <nav className="header-nav" aria-label="Main">
          {user ? (
            <>
              <Link href="/app" className="nav-link">My cards</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Log in</Link>
              <Link href="/signup" className="btn btn-small">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
