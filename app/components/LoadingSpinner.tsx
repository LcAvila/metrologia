import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      <span className="mt-4 text-blue-600 font-semibold">Carregando...</span>
    </div>
  );
}
