'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const router = useRouter();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const userProfile = await authService.getUserProfile();
        
        if (userProfile) {
          // Redirecionar com base no tipo de usuário
          const redirectUrl = authService.getRedirectUrl(userProfile.tipo_usuario);
          console.log(`Usuário já autenticado como ${userProfile.tipo_usuario}. Redirecionando para ${redirectUrl}`);
          router.push(redirectUrl);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Não fazemos nada aqui, apenas permite que o usuário veja a página de login
      }
    };
    
    checkAuthentication();
  }, [router]);

  return (
    <main className="dark">
      <LoginForm />
    </main>
  );
}
