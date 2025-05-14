import React from 'react';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Acesso não autorizado</h1>
      <p className="mb-6">Você não tem permissão para acessar esta página.</p>
      <a href="/login" className="text-blue-400 underline">Voltar para o login</a>
    </div>
  );
}
