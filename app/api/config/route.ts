import { NextRequest, NextResponse } from 'next/server';
import { createServerAnonClient, createServiceClient } from '@/lib/supabase/server';

const ALLOWED_FIELDS = new Set([
  'bride_name', 'groom_name', 'wedding_date', 'venue_name', 'venue_address',
  'maps_url', 'dresscode', 'extra_notes', 'bank1_code', 'bank1_account',
  'bank1_holder', 'bank2_code', 'bank2_account', 'bank2_holder', 'music_url', 'photos',
]);

export async function GET() {
  const supabase = await createServerAnonClient();
  const { data, error } = await supabase
    .from('wedding_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('wedding_config')
    .update(updates)
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
