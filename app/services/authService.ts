import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export type UserRoleType = 'admin' | 'metrologista' | 'quimico';

/**
 * Interface para usuário completo (dados do Auth + dados da tabela usuarios)
 */
export interface UsuarioCompleto {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: UserRoleType;
  matricula?: string;
  created_at?: string;
  is_authenticated: boolean;
}

/**
 * Serviço unificado para autenticação e gerenciamento de usuários
 */
export const authService = {
  /**
   * Login com email e senha
   */
  async login(email: string, password: string): Promise<{user: User | null, session: Session | null, error: any}> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { 
        user: data.user, 
        session: data.session,
        error: null
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { user: null, session: null, error };
    }
  },

  /**
   * Logout do usuário atual
   */
  async logout(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { error };
    }
  },

  /**
   * Recupera o usuário atual com seus dados completos
   */
  async getUserProfile(): Promise<UsuarioCompleto | null> {
    try {
      // Verifica se há um usuário autenticado
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Usuário não autenticado:', authError);
        return null;
      }

      // Busca os dados adicionais do usuário na tabela personalizada
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        return null;
      }

      return {
        ...userData,
        email: authData.user.email || '',
        is_authenticated: true
      };
    } catch (error) {
      console.error('Erro ao recuperar perfil do usuário:', error);
      return null;
    }
  },

  /**
   * Verifica e atualiza a sessão do usuário
   * Útil para renovar o token JWT automaticamente
   */
  async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao atualizar sessão:', error);
        return false;
      }
      
      return !!data.session;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      return false;
    }
  },

  /**
   * Verifica se o usuário tem permissão para acessar determinada área
   * @param requiredRole Papel necessário para acesso
   * @returns Booleano indicando se tem permissão
   */
  async hasPermission(requiredRole: UserRoleType | UserRoleType[]): Promise<boolean> {
    const user = await this.getUserProfile();
    
    if (!user) return false;
    
    // Admin tem acesso a tudo
    if (user.tipo_usuario === 'admin') return true;
    
    // Verifica se o tipo do usuário está na lista de papéis permitidos
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.tipo_usuario);
    }
    
    // Verifica papel específico
    return user.tipo_usuario === requiredRole;
  },

  /**
   * Obtém a URL para redirecionamento após login baseada no tipo de usuário
   */
  getRedirectUrl(tipoUsuario: UserRoleType): string {
    switch (tipoUsuario) {
      case 'admin':
        return '/admin';
      case 'metrologista':
        return '/metrologia';
      case 'quimico':
        return '/fdu';
      default:
        return '/';
    }
  }
};

/**
 * Hook para configurar o listener de mudança de estado de autenticação
 * Deve ser chamado em um componente de nível alto (como _app.tsx ou layout.tsx)
 */
export const setupAuthListener = (callback?: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // Eventos possíveis: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
      console.log(`Auth event: ${event}`);
      
      // Quando o token é atualizado, pode ser útil atualizar o estado da aplicação
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token JWT renovado automaticamente');
      }
      
      // Callback opcional para atualizar o estado da aplicação
      if (callback) {
        callback(session);
      }
    }
  );

  // Retorna função para cancelar a inscrição (útil para cleanup)
  return () => {
    subscription.unsubscribe();
  };
};
