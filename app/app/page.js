import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CardsClient from './CardsClient';

export const metadata = { title: 'My cards · CramCards' };

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [cardsRes, subjectsRes] = await Promise.all([
    supabase
      .from('cards')
      .select('id, question, answer, subject_id, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('subjects').select('id, name').order('name'),
  ]);
  const error = cardsRes.error ?? subjectsRes.error;

  return (
    <CardsClient
      initialCards={cardsRes.data ?? []}
      initialSubjects={subjectsRes.data ?? []}
      loadError={error?.message ?? ''}
    />
  );
}
