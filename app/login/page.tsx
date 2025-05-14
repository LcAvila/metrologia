'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import LoginForm from '../components/login/LoginForm';
import { checkAuth, getUserType } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient'; // Ajuste o caminho se necessário

export default function LoginPage() {
  const [expiredMsg, setExpiredMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Checa se houve expiração de sessão
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('sessionExpired') === 'true') {
        setExpiredMsg('Sua sessão expirou. Faça login novamente.');
        sessionStorage.removeItem('sessionExpired');
      }
    }
  }, []);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      const session = await checkAuth();
      if (session && session.user) {
        try {
          const tipo = await getUserType(session.user.id);
          if (tipo === 'admin') {
            router.push('/admin');
          } else if (tipo === 'metrologista') {
            router.push('/metrologia');
          } else if (tipo === 'quimico') {
            router.push('/fispq');
          } else {
            router.push('/unauthorized');
          }
        } catch (error: any) {
          // Verifica se é erro de JWT expirado
          if (error?.message?.includes('JWT expired')) {
            // Faz logout e redireciona para login
            const { signOut } = await import('../lib/supabaseClient');
            await signOut();
            router.push('/login');
          } else {
            // Outro erro
            router.push('/unauthorized');
          }
        }
      }
    };
    
    checkAuthentication();
  }, [router]);

  return (
    <>

      
      <main className="dark">
        <LoginForm />
      </main>
    </>
  );
}
