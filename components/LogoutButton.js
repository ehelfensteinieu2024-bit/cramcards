'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await createClient().auth.signOut();
    // Full reload so the server-rendered header updates too.
    window.location.assign('/');
  }

  return (
    <button
      type="button"
      data-testid="logout"
      className="btn btn-small btn-secondary"
      onClick={handleLogout}
      disabled={busy}
    >
      {busy ? 'Logging out…' : 'Log out'}
    </button>
  );
}
