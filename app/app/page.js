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

  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, question, answer, created_at')
    .order('created_at', { ascending: false });

  return <CardsClient initialCards={cards ?? []} loadError={error?.message ?? ''} />;
}
