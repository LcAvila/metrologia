import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// Use apenas variáveis de ambiente do servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  // Opcional: Adicione autenticação de admin aqui!
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ users: data.users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
