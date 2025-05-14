'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Importar o Dashboard com carregamento dinâmico para evitar problemas de SSR com componentes de cliente
const DashboardPage = dynamic(() => import('./dashboard'), { ssr: false });

// Loader de carregamento para usar durante o carregamento dinâmico
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="bg-gray-800/50 rounded-lg p-8 shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <h3 className="text-xl text-white font-medium">Carregando dashboard...</h3>
        </div>
        <p className="text-gray-400 mt-4 text-center">
          Preparando estatísticas e informações do sistema.
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardPage />
    </Suspense>
  );
}

