import { createClient } from '@supabase/supabase-js';

// Essas variáveis de ambiente devem ser configuradas no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para login com email e senha
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Função para enviar email de redefinição de senha
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
}

// Função para obter o tipo de usuário (metrologista ou químico)
export async function getUserType(userId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('tipo_usuario')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Erro ao buscar tipo de usuário:', error);
    return null;
  }
  
  return data?.tipo_usuario;
}

// Função para verificar se o usuário está autenticado
export async function checkAuth() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Função para fazer logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
