"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirecionamento após 3 segundos
    const timer = setTimeout(() => {
      setLoading(false);
      router.push("/consulta");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 bg-clip-text text-transparent mb-4">
          AVZ Quality
        </h1>
        <p className="text-gray-300 text-xl">Precisão e Segurança em Harmonia</p>
      </div>

      <div className="flex space-x-8 mb-12">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg transition-all hover:scale-105">
          <div className="text-blue-500 text-4xl mb-2">⚙️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Metrologia</h2>
          <p className="text-gray-400">Controle preciso de instrumentos</p>
        </div>

        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg transition-all hover:scale-105">
          <div className="text-green-500 text-4xl mb-2">🛡️</div>
          <h2 className="text-white text-xl font-semibold mb-2">FDU</h2>
          <p className="text-gray-400">Gestão de fichas de utilização</p>
        </div>
      </div>

      {loading && (
        <div className="mt-6">
          <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-progress-bar"></div>
          </div>
        </div>
      )}
    </div>
  );
}
