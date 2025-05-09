'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import LoginForm from '../components/login/LoginForm';
import { checkAuth } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      const session = await checkAuth();
      
      // Se já estiver autenticado, redirecionar para a página inicial
      if (session) {
        router.push('/');
      }
    };
    
    checkAuthentication();
  }, [router]);

  return (
    <>
      <Head>
        <title>Login | Metrologia Compactor</title>
        <meta name="description" content="Faça login no sistema de Metrologia e FISPQ da Compactor" />
      </Head>
      
      <main className="dark">
        <LoginForm />
      </main>
    </>
  );
}
