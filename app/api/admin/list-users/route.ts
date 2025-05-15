import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(req: NextRequest) {
  // Verificação de permissão
  try {
    // Buscar usuários diretamente da tabela usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo_usuario');
    
    if (error) {
      console.error('Erro ao buscar usuários:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ users: data });
  } catch (err: any) {
    console.error('Erro inesperado:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
