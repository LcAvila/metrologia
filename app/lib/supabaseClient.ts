import { createClient } from '@supabase/supabase-js';

// Essas variáveis de ambiente devem ser configuradas no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para buscar email pelo campo usuario
export async function getEmailFromUsuario(matricula: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios') // Or your actual table name for user profiles
      .select('email')
      .eq('matricula', matricula) // Ensure 'matricula' is the correct column name in your DB
      .single();

    if (error) {
      console.error('Error fetching email from matricula:', error);
      return null;
    }
    return data?.email || null;
  } catch (err) {
    console.error('Unexpected error in getEmailFromUsuario:', err);
    return null;
  }
}

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

// Função para obter o tipo de usuário (admin, metrologista ou químico)
export async function getUserType(userId: string) {
  try {
    // Primeiro, vamos verificar se o usuário existe
    console.log('Buscando usuário com ID:', userId);
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro detalhado ao buscar usuário:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Lança erro se JWT expirou ou 401
      if (
        error.message?.toLowerCase().includes('jwt expired') ||
        error.code === 'PGRST301' ||
        error.code === '401' ||
        error.message?.toLowerCase().includes('unauthorized')
      ) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sessionExpired', 'true');
        }
        throw new Error('JWT expired');
      }
      return null;
    }

    if (!data) {
      console.log('Usuário não encontrado. Criando novo registro...');
      
      // Se o usuário não existe na tabela usuarios, vamos criar
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          tipo_usuario: 'admin', // Definindo como admin por padrão
          email: (await supabase.auth.getUser()).data.user?.email,
          nome: 'Administrador'
        });

      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        return null;
      }

      return 'admin';
    }

    console.log('Dados do usuário encontrados:', data);
    
    // Normalizar o tipo de usuário
    let tipoUsuario = data.tipo_usuario?.trim().toLowerCase();
    if (tipoUsuario === 'administrador') tipoUsuario = 'admin';
    if (tipoUsuario === 'metrologista' || tipoUsuario === 'quimico' || tipoUsuario === 'admin') {
      return tipoUsuario;
    }
    
    // Se o tipo não for válido, atualizar para admin
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ tipo_usuario: 'admin' })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar tipo de usuário:', updateError);
    }

    return 'admin';
  } catch (error) {
    console.error('Erro inesperado ao buscar/criar usuário:', error);
    throw error;
  }
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
