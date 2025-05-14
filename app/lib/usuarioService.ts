import { supabase } from './supabaseClient';

export interface Usuario {
  id: string;
  email: string;
  tipo_usuario: string;
  nome: string;
  sobrenome: string;
  idade?: number;
  foto?: string;
}

export async function getUsuarioLogado(): Promise<Usuario | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error || !data) return null;
  return data as Usuario;
}
