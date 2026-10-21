import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewClient from './ReviewClient';

export const metadata = { title: 'Review · CramCards' };

export default async function ReviewPage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Same RLS as /app: each query only returns this user's rows.
  const [cardsRes, subjectsRes] = await Promise.all([
    supabase
      .from('cards')
      .select('id, question, answer, subject_id, created_at')
      .order('created_at', { ascending: true }),
    supabase.from('subjects').select('id, name').order('name'),
  ]);
  const error = cardsRes.error ?? subjectsRes.error;
  const { subject } = await searchParams;

  return (
    <ReviewClient
      cards={cardsRes.data ?? []}
      subjects={subjectsRes.data ?? []}
      initialSubject={typeof subject === 'string' ? subject : ''}
      loadError={error?.message ?? ''}
    />
  );
}
