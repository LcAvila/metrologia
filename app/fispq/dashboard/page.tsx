"use client";
import Layout from '../../components/Layout';

import { useEffect, useState } from "react";
import { fispqService } from "../services/fispqService";

export default function FispqDashboard() {
  const [stats, setStats] = useState<{ total: number; expirando: number; setores: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fispqService.getStatistics()
      .then(setStats)
      .catch(() => setError("Erro ao carregar estatísticas."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Dashboard FISPQ">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard FISPQ</h1>
        {loading && <p className="text-gray-600">Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-[var(--primary)]">{stats.total}</span>
              <span className="mt-2 text-gray-700 dark:text-gray-200">Total de FISPQs</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-yellow-500">{stats.expirando}</span>
              <span className="mt-2 text-gray-700 dark:text-gray-200">Expirando em 30 dias</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-green-600">{stats.setores}</span>
              <span className="mt-2 text-gray-700 dark:text-gray-200">Setores distintos</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

